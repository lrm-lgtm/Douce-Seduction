(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const cfg = window.DOUCE_CATALOG_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url || '')
    && typeof cfg.publishableKey === 'string'
    && /^(sb_publishable_|eyJ)/.test(cfg.publishableKey);
  const state = { db: null, products: [], edit: null, user: null, previewUrl: null };
  const show = (id, yes) => $(id).classList.toggle('hidden', !yes);
  const report = (msg, type = '') => {
    $('status').textContent = msg || '';
    $('status').className = 'status ' + type;
  };
  const money = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  function picture(p) {
    if (p.image_path && /^products\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(p.image_path)) {
      return state.db.storage.from('douce-catalog').getPublicUrl(p.image_path).data.publicUrl;
    }
    return typeof p.image_url === 'string' && /^https:\/\//.test(p.image_url) ? p.image_url : '';
  }
  async function authorized(user) {
    if (!user) return false;
    const { data, error } = await state.db.from('douce_catalog_admins')
      .select('user_id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return data?.user_id === user.id;
  }
  async function session() {
    const { data, error } = await state.db.auth.getUser();
    if (error || !data?.user || !(await authorized(data.user))) {
      if (data?.user) await state.db.auth.signOut();
      state.user = null;
      show('login', true);
      show('dashboard', false);
      return;
    }
    state.user = data.user;
    $('accountLabel').textContent = 'Conta: ' + (data.user.email || 'administradora');
    show('login', false);
    show('dashboard', true);
    await load();
  }
  async function load() {
    const { data, error } = await state.db.from('douce_products')
      .select('id,name,description,category,price,stock,active,image_path,image_url,created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    state.products = data || [];
    renderProducts();
    report('Catálogo sincronizado com o banco de dados.', 'success');
  }
  function renderProducts() {
    const all = state.products;
    $('countTotal').textContent = all.length + (all.length === 1 ? ' produto' : ' produtos');
    $('countActive').textContent = all.filter(x => x.active).length + ' publicados';
    $('countLow').textContent = all.filter(x => x.stock <= 3).length + ' com baixo estoque';
    const list = $('productList');
    list.replaceChildren();
    if (!all.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Sem produtos. Cadastre o primeiro pelo formulário.';
      list.append(empty);
      return;
    }
    for (const p of all) {
      const item = document.createElement('div');
      item.className = 'product';
      const img = document.createElement('img');
      img.alt = p.name || 'Produto';
      if (picture(p)) img.src = picture(p);
      const middle = document.createElement('div');
      const heading = document.createElement('b');
      heading.textContent = p.name;
      const caption = document.createElement('small');
      caption.textContent = money(p.price) + ' · ' + p.stock + ' em estoque · ' + (p.active ? 'Publicado' : 'Rascunho');
      middle.append(heading, caption);
      const edit = document.createElement('button');
      edit.className = 'btn secondary';
      edit.type = 'button';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => select(p.id));
      item.append(img, middle, edit);
      list.append(item);
    }
  }
  function clearPreview() {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
    $('preview').removeAttribute('src');
    show('preview', false);
  }
  function resetForm() {
    state.edit = null;
    $('productForm').reset();
    $('pStock').value = 0;
    $('pActive').checked = false;
    $('formTitle').textContent = 'Novo produto';
    $('saveProduct').textContent = 'Salvar produto';
    clearPreview();
    $('pName').focus();
  }
  function select(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    state.edit = p;
    $('pName').value = p.name || '';
    $('pCategory').value = p.category || '';
    $('pPrice').value = String(p.price).replace('.', ',');
    $('pStock').value = String(p.stock);
    $('pDescription').value = p.description || '';
    $('pImage').value = '';
    $('pActive').checked = !!p.active;
    $('formTitle').textContent = 'Editar produto';
    $('saveProduct').textContent = 'Salvar alterações';
    clearPreview();
    const url = picture(p);
    if (url) { $('preview').src = url; show('preview', true); }
    $('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function parsePrice(str) {
    const value = String(str).replace(/[R$\s]/g, '');
    return Number(value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value);
  }
  async function optimize(file) {
    const image = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.84));
      if (!blob || blob.size > 5 * 1024 * 1024) throw new Error('A foto otimizada excede 5 MB.');
      return blob;
    } finally { image.close(); }
  }
  async function uploadPhoto(file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error('Selecione uma imagem JPG, PNG ou WebP de até 5 MB.');
    }
    const blob = await optimize(file);
    const path = 'products/' + crypto.randomUUID() + '.jpg';
    const { error } = await state.db.storage.from('douce-catalog')
      .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
    if (error) throw error;
    return path;
  }
  $('pImage').addEventListener('change', () => {
    clearPreview();
    const f = $('pImage').files?.[0];
    if (f) { state.previewUrl = URL.createObjectURL(f); $('preview').src = state.previewUrl; show('preview', true); }
  });
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('loginForm').querySelector('button');
    btn.disabled = true;
    report('Verificando acesso…');
    try {
      const { error } = await state.db.auth.signInWithPassword({
        email: $('email').value.trim(), password: $('password').value
      });
      $('password').value = '';
      if (error) throw error;
      await session();
      if (!state.user) throw new Error('Usuário sem permissão de administrador.');
    } catch (err) { report(err.message || 'Falha no acesso.', 'error'); }
    finally { btn.disabled = false; }
  });
  $('logout').addEventListener('click', async () => {
    await state.db.auth.signOut();
    state.user = null;
    show('dashboard', false);
    show('login', true);
    report('Sessão encerrada.');
  });
  $('newProduct').addEventListener('click', resetForm);
  $('cancelEdit').addEventListener('click', resetForm);
  $('productForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!state.user) return;
    const btn = $('saveProduct');
    btn.disabled = true;
    report('Salvando…');
    try {
      const name = $('pName').value.trim();
      const category = $('pCategory').value.trim();
      const description = $('pDescription').value.trim();
      const price = parsePrice($('pPrice').value);
      const stock = Number($('pStock').value);
      const active = $('pActive').checked;
      const file = $('pImage').files?.[0] || null;
      if (name.length < 2 || name.length > 120 || category.length < 2 || category.length > 70
        || description.length > 2500 || !Number.isFinite(price) || price <= 0 || price > 100000
        || !Number.isInteger(stock) || stock < 0 || stock > 1000000) throw new Error('Revise os dados do produto.');
      if (active && !file && !picture(state.edit || {})) throw new Error('Inclua uma foto antes de publicar.');
      const values = { name, category, description, price: Number(price.toFixed(2)), stock, active };
      if (file) { values.image_path = await uploadPhoto(file); values.image_url = null; }
      let result;
      if (state.edit) result = await state.db.from('douce_products').update(values).eq('id', state.edit.id).select('id').single();
      else result = await state.db.from('douce_products').insert(values).select('id').single();
      if (result.error) throw result.error;
      await load();
      resetForm();
      report('Produto salvo e catálogo sincronizado.', 'success');
    } catch (err) {
      report(err.message || 'Não foi possível salvar.', 'error');
    } finally { btn.disabled = false; }
  });
  async function start() {
    if (!configured || !window.supabase?.createClient) {
      show('setup', true);
      report('Backend ainda não configurado.', 'error');
      return;
    }
    try {
      state.db = window.supabase.createClient(cfg.url, cfg.publishableKey);
      await session();
    } catch (err) {
      report('Falha ao conectar: ' + (err.message || 'verifique as configurações'), 'error');
      show('login', false);
      show('dashboard', false);
    }
  }
  start();
})();
