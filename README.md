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
