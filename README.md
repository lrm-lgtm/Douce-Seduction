# Douce Séduction

Piloto web mobile-first para catálogo +18 com carrinho, cadastro de produtos, controle simples de estoque, pedidos e integração com WhatsApp.

## Estado atual

- Catálogo responsivo
- Gate 18+
- Carrinho
- Checkout de teste
- Painel administrativo local
- Cadastro/edição de produtos com foto pelo celular
- Estoque local
- Pedidos locais
- Simulação de pagamento
- Envio do pedido pelo WhatsApp
- Persistência via `localStorage`

## Abrir localmente

Basta abrir o arquivo `index.html` no navegador.

## Observação

Esta versão é um piloto front-end. Dados ficam no navegador e o pagamento é simulado. A próxima evolução pode transformar o projeto em PWA instalável e adicionar backend, sincronização, autenticação e pagamento real.

## Limites importantes

O PIN do painel e a simulação de pagamento existem apenas para demonstração e não são mecanismos de segurança. Não use esta versão para receber pagamentos reais ou armazenar dados de clientes. Para produção, pedidos, estoque, autenticação e confirmação de pagamento devem ser movidos para um backend com banco de dados e webhooks idempotentes.

## Melhorias recentes

- validação de preço, estoque, imagem, nome, telefone e observação;
- proteção contra baixa duplicada de estoque no mesmo pedido;
- escape de dados cadastrados antes da exibição;
- mensagem de WhatsApp com itens, entrega e observação;
- atributos básicos de acessibilidade no gate de idade.


## Catálogo centralizado (em homologação, branch `feature/catalogo-supabase-20261105`)

Esta branch acrescenta painel protegido em `admin.html`, com dados em Supabase independente da loja. A proprietária poderá editar preço, nome, estoque, foto e disponibilidade pelo celular; a vitrine pública lê os dados compartilhados do banco. Os 4 itens iniciais são rascunhos, sem publicação automática.

O checkout permanece **fictício**, sem aceitar pagamento, enviar pedidos ou diminuir o estoque centralizado. A versão pública anterior do site permanece preservada na branch `feature/homologacao-20261105`.

**Acesso:** a conta da proprietária precisa ser criada e autorizada no painel Supabase antes de ser usada. Não existe registro público ou PIN de teste no painel novo. Instruções, permissões, URLs e roteiro de testes: [docs/CATALOGO_SUPABASE.md](docs/CATALOGO_SUPABASE.md).

**Chaves:** `catalog-config.js` contém somente a chave publishable projetada para uso público. Nunca incluir service_role, senhas ou segredos no repositório.
