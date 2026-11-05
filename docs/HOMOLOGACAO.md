# Douce Seduction — homologação 05/11/2026

## Identificação
- Repositório: `lrm-lgtm/Douce-Seduction`
- Base imutável: `main`, `7cfb389f5`
- Referência de fluxo: `ff30ef2ed`
- Branch: `feature/homologacao-20261105`
- Estado: **DEMO local / NÃO É PRODUÇÃO**.
- Publicação: **Netlify**, em vez da Vercel originalmente prevista.
- URL pública: **não confirmada até o deploy ser efetivamente publicado e validado**.

## Escopo entregue no código
- Visual Dark Luxury (preto, vinho, dourado) com grade responsiva e hero.
- Gate 18+ e marca sem acento.
- Vitrine com fotos e produtos fictícios, filtro de categorias e busca.
- Carrinho com adição, redução e alteração de quantidades.
- Checkout com cliente/telefone fictícios e bloqueados (não recebe dados reais).
- Pedidos e simulação de pagamento **apenas em localStorage**, isolados no prefixo `douce_demo_20261105_`.
- Estoque local, painel de teste sem autenticação real e inclusão/edição de produtos com foto no mesmo navegador.
- Mensagem de pedido exibida apenas na tela; **não enviada ao WhatsApp**.
- Cabeçalhos de segurança e exclusão da indexação por mecanismos de busca.

## Limites obrigatórios
1. Nenhuma compra real, entrega real, cobrança, pagamento ou comunicação externa é realizada.
2. Alterações são locais ao navegador/dispositivo. Não há banco de dados, login ou sincronização.
3. Painel sem autenticação: é intencional e aceitável somente neste **ambiente de demonstração**. Não usar em produção.
4. Aviso 18+ é autodeclaração, não verificação documental de idade.
5. O catálogo contém quatro produtos e estoques de exemplo. Nomes, valores e imagens precisam de aprovação do cliente.
6. `localStorage` pode ser apagado pelo navegador. Não inserir dados pessoais reais.
7. Não há gateway de pagamentos. A mensagem simulada não sai do aparelho.
8. Site criado/conectado não equivale a deploy pronto: **validar URL com resposta HTTP 200 e teste funcional antes de enviar ao cliente**.

## Teste manual de aceite
- [ ] Abrir em Android, iPhone e desktop; verificar logotipo, imagens e layout.
- [ ] Gate de idade aparece em navegador sem cache.
- [ ] Abrir catálogo, buscar por nome, aplicar e limpar categoria.
- [ ] Adicionar dois produtos, mudar quantidades e conferir total.
- [ ] Finalizar pedido fictício usando dados bloqueados; aprovar pagamento fictício.
- [ ] Abrir prévia da mensagem; constatar que nenhum aplicativo é acionado.
- [ ] Abrir painel, cadastrar produto com foto, editar preço e quantidade.
- [ ] Atualizar página; conferir persistência **somente nesse navegador**.
- [ ] Repetir em viewport pequeno; testar navegação inferior sem sobreposições.
- [ ] Inspecionar console e rede; não pode haver erros de JS ou requisições de pedido/pagamento reais.

## Testes automatizados
A workflow `.github/workflows/homologacao-e2e.yml` executa Playwright no pull request (Chromium desktop e emulação Pixel), gerando screenshots como artefatos de CI. O teste necessita aprovação de execução pelo GitHub quando aplicável. **Teste escrito não significa teste executado**: verificar o run e seus resultados.

## Publicação correta na Netlify
1. Acessar Netlify → Add new project → Import existing project → GitHub.
2. Escolher `lrm-lgtm/Douce-Seduction`. Build command vazio; publish directory `.`, definido no `netlify.toml`.
3. Não mesclar `main`. Para demonstrar a branch, habilitar **Branch deploys** para `feature/homologacao-20261105` ou habilitar **Deploy Previews** do PR.
4. Se `main` for configurada como production branch, a URL principal poderá servir a vitrine antiga. **Compartilhar o URL específico do preview/branch**, não o domínio raiz.
5. Acessar o URL do deploy na Netlify; conferir status Ready, HTTP 200 e teste funcional. Somente então encaminhar ao cliente.
6. Restringir acesso ao preview, se necessário, em Project configuration → Visitor access (proteção de preview depende do plano).
7. Não usar o login/painel de demonstração como autenticação real nem usar a URL para vendas.

## Recuperação e cancelamento
O commit base da `main` não é alterado. Um PR não aceito pode ser simplesmente fechado. Caso a Netlify já tenha publicado um deploy da branch e haja erro, corrigir na branch e realizar novo deploy; não substituir a produção por uma versão não validada.

## Após a aprovação do visual
- Backend com autenticação e controle de acesso (RLS); estoque e pedidos compartilhados.
- CRUD de produtos e upload validados no servidor; isolamento por usuário.
- Checkout com dados protegidos, política LGPD, comprovante e frete.
- Gateway que aceite a categoria de produtos; webhooks verificados, idempotência e validação de valores.
- Verificação de regras de idade/conteúdo e políticas da hospedagem e do meio de pagamento.
- Testes de ponta a ponta com ambientes de staging e produção separados.
