# Douce Seduction — catálogo centralizado (Supabase)

## Infraestrutura efetivamente criada (05/11/2026)
- Organização: `LRM'dev`; projeto independente `douce-seduction`.
- Project ref: `larfbhuuybjwuoaneaob`, região `sa-east-1`.
- URL: `https://larfbhuuybjwuoaneaob.supabase.co`.
- Painel Supabase: https://supabase.com/dashboard/project/larfbhuuybjwuoaneaob
- Homologação Netlify atual (continua intacta): https://douceseduction.netlify.app
- Branch de integração: `feature/catalogo-supabase-20261105`; não mesclar até aceite.
- Credencial no `catalog-config.js`: somente **publishable key**, segura para cliente público, sem privilégios de escrita em banco. Nunca expor secret/service-role.

## Módulos do site
- `index.html`: vitrine pública lê `douce_products` via REST, com RLS; atualiza ao abrir/retornar à aba e a cada minuto.
- `admin.html` + `assets/catalog-admin.js`: login via Supabase Auth (e-mail/senha), cadastro/edição de produtos, fotos, preços, estoque e publicação.
- `catalog-config.js`: URL + chave pública do projeto (sem segredo).
- `supabase/migrations/`: SQL versionado (executado no Supabase). Guardar migration no Git; não reexecutar inicial em projeto já preenchido.
- O checkout legado permanece **estritamente de teste**, sem enviar pedidos ou pagamentos reais. Somente o catálogo passa a ser compartilhado.

## Dados iniciais
Quatro produtos do protótipo foram importados como **rascunhos (active=false)**; revise nomes, fotos, preços e quantidades antes de publicá-los.
Nenhuma conta administrativa foi criada automaticamente e ninguém recebe acesso sem autorização explícita.

## Criar acesso da proprietária — passo manual necessário
**Não solicite senha pelo chat nem coloque senha em arquivos GitHub.**

1. Abra https://supabase.com/dashboard/project/larfbhuuybjwuoaneaob/auth/users
2. Em Authentication → Users, escolha "Add user" e crie/convide a proprietária usando o e-mail que ela autorizou. Defina credenciais apenas no painel Supabase; não no GitHub.
3. Copie o **UUID (user_id)** criado pelo Supabase.
4. No SQL Editor do projeto, execute:

```sql
insert into public.douce_catalog_admins(user_id)
values ('UUID_REAL_DA_PROPRIETARIA')
on conflict (user_id) do nothing;
```

5. Abra o preview de `admin.html` na Netlify; faça login com a conta criada. Sem a inserção acima, autenticar não concede permissão de administrador.
6. Cadastre um produto de teste com imagem, mantendo **Publicado** desmarcado; salve e veja que somente a administradora pode encontrá-lo.
7. Depois de revisar o item, marque **Publicado**. Verifique que agora aparece no catálogo, inclusive em um segundo aparelho sem login.
8. Desative o produto e confirme que ele some da vitrine pública.
9. Não conceda admin alterando `user_metadata`, nem criando um PIN em JavaScript; use apenas a tabela protegida.

## Testes e regras de segurança
- RLS da tabela de produtos permite `select` público apenas para produtos publicados, e DML apenas a autenticados explicitamente autorizados.
- `douce_catalog_admins` não concede escrita ao cliente, RLS limita leituras ao próprio usuário.
- Fotos ficam no bucket público `douce-catalog` e somente administradores podem enviá-las.
- Serviço de backend usa apenas a chave pública no navegador; Postgres valida o token e as policies.
- Cadastro de contas público não está presente na interface; ainda vale desabilitar inscrição aberta no dashboard Supabase se não houver necessidade.
- Não inserir dados pessoais reais no checkout de simulação.
- Não integrar pagamentos ou permitir pedidos comerciais antes de controle de autenticação, políticas e homologação.
- Configurar URL do site em Supabase Auth → URL Configuration quando for usar fluxos de confirmação por e-mail ou redefinição de senha.

## Netlify / preview
A branch principal da Netlify é `feature/homologacao-20261105`. **Não alterar a produção** automaticamente.
Abra PR desta nova branch contra `feature/homologacao-20261105`. Se Netlify Git CI estiver integrado, um Deploy Preview será criado. Confirme o URL e o resultado dos testes E2E antes de compartilhar com a cliente.
Se o preview não aparecer, configure Deploy Previews ou Branch Deploys no projeto Netlify; não mescle a branch de integração no site atual.

## Limitações remanescentes
- Não existe exclusão de produtos no painel, para evitar perda acidental; é possível despublicá-los.
- Estoque, preço e fotos são centralizados, porém os **pedidos ainda não**; esta fase não aceita vendas reais.
- Não existe autenticação do cliente final.
- O projeto Supabase Free pode pausar por inatividade e possui cotas de uso; verificar limites no dashboard.
- Foto enviada sem gravação bem sucedida do cadastro pode ficar órfã no Storage; revisar posteriormente.
