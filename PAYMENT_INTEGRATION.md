# Integração de Pagamentos - E-Buteco

Este documento descreve como usar as funcionalidades de pagamento implementadas no sistema E-Buteco.

## Funcionalidades Implementadas

### 1. Pagamento via PIX
- Criação de pedidos PIX através do PagSeguro
- Geração automática de QR Code
- Webhook para notificações de pagamento

### 2. Pagamento via Cartão de Crédito/Débito
- Processamento de pagamentos via cartão
- Suporte a parcelamento (1-12x)
- Validação de dados do cartão
- Webhook para confirmação de pagamento

### 3. Webhook do PagSeguro
- Captura automática de notificações de pagamento
- Atualização automática do status dos pedidos
- Registro de pagamentos na base de dados

## Endpoints Disponíveis

### Pagamento PIX
```
POST /pay/pix
```

**Body:**
```json
{
  "reference_id": "pedido-123",
  "name": "Pedido Mesa 1",
  "quantity": 1,
  "unit_amount": 50.00
}
```

**Response:**
```json
{
  "message": "Pedido PIX criado com sucesso",
  "data": {
    "id": "order-id-pagseguro",
    "qr_codes": [
      {
        "id": "qr-code-id",
        "text": "pix-copy-paste-code",
        "links": [
          {
            "href": "https://api.pagseguro.com/qrcodes/qr-code-id.png",
            "rel": "QRCODE.PNG",
            "media": "image/png"
          }
        ]
      }
    ]
  }
}
```

### Pagamento via Cartão
```
POST /pay/card
```

**Body:**
```json
{
  "orderId": "uuid-do-pedido",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "tax_id": "12345678909",
    "phones": [
      {
        "country": "55",
        "area": "11",
        "number": "999999999",
        "type": "MOBILE"
      }
    ]
  },
  "card": {
    "number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2025",
    "security_code": "123",
    "holder": {
      "name": "JOAO SILVA"
    }
  },
  "installments": 1
}
```

**Response:**
```json
{
  "message": "Pagamento via cartão processado com sucesso",
  "data": {
    "id": "order-id-pagseguro",
    "status": "PAID",
    "charges": [
      {
        "id": "charge-id",
        "status": "PAID",
        "amount": {
          "value": 100.00,
          "currency": "BRL"
        }
      }
    ]
  }
}
```

### Webhook PagSeguro
```
POST /webhook/pagseguro
```

Este endpoint é chamado automaticamente pelo PagSeguro quando há mudanças no status do pagamento.

### Verificar Status do Pagamento
```
GET /payment/status/:orderId
```

**Response:**
```json
{
  "orderId": "uuid-do-pedido",
  "paymentStatus": {
    "id": "order-id-pagseguro",
    "status": "PAID",
    "charges": [...]
  },
  "localStatus": {
    "wasPaid": "TRUE",
    "status": "PENDING"
  }
}
```

## Fluxo de Pagamento

### 1. Criação do Pedido
1. Cliente faz pedido via `POST /order/:tableId`
2. Sistema cria pedido com status `PENDING` e `wasPaid: FALSE`

### 2. Processamento do Pagamento
1. Cliente escolhe forma de pagamento (PIX ou Cartão)
2. Sistema processa pagamento via PagSeguro
3. Pedido é atualizado com `paymentId`

### 3. Confirmação via Webhook
1. PagSeguro envia notificação para `/webhook/pagseguro`
2. Sistema atualiza pedido com `wasPaid: TRUE`
3. Pagamento é registrado na tabela `Payments`

## Configuração de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
APP_URL=https://seu-dominio.com
PAGBANK_TESTE=seu-token-sandbox
PAGBANK_PRODUCTION=seu-token-producao
PAGBANK_SANDBOX=true
```

## Valores Mínimos e Máximos

### Pagamento via PIX
- **Valor mínimo**: R$ 0,01
- **Valor máximo**: R$ 50.000,00

### Pagamento via Cartão
- **Valor mínimo**: R$ 100,00 (sandbox) / R$ 1,00 (produção)
- **Valor máximo**: R$ 50.000,00
- **Parcelamento**: 1 a 12x

## Observações Importantes

1. **Ambiente de Teste**: O sistema está configurado para usar o ambiente sandbox do PagSeguro
2. **Valor Mínimo**: Para pagamentos via cartão, o valor mínimo é **R$ 100,00** no ambiente sandbox
3. **Webhook**: Certifique-se de que a URL do webhook está acessível publicamente
4. **Segurança**: Em produção, implemente validação de assinatura do webhook
5. **Logs**: Todos os eventos de pagamento são logados no console

## Exemplo de Uso Completo

```javascript
// 1. Criar pedido
const order = await fetch('/order/table-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment: 'CARD',
    products: [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 }
    ]
  })
});

// 2. Processar pagamento
const payment = await fetch('/pay/card', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: order.id,
    customer: { /* dados do cliente */ },
    card: { /* dados do cartão */ },
    installments: 1
  })
});

// 3. Verificar status (opcional)
const status = await fetch(`/payment/status/${order.id}`);
```

## Exemplo de Teste Prático

### Teste de Pagamento via Cartão (Valor Mínimo)
```bash
curl -X POST http://localhost:3333/pay/card \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid-do-pedido-existente",
    "customer": {
      "name": "João Silva",
      "email": "joao@test.com",
      "tax_id": "12345678909",
      "phones": [{
        "country": "55",
        "area": "11",
        "number": "999999999",
        "type": "MOBILE"
      }]
    },
    "card": {
      "number": "4111111111111111",
      "exp_month": "12",
      "exp_year": "2025",
      "security_code": "123",
      "holder": {
        "name": "JOAO SILVA"
      }
    },
    "installments": 1
  }'
```

**⚠️ Importante**: Certifique-se de que o pedido existe no banco de dados e tenha um valor mínimo de R$ 100,00 para pagamentos via cartão.
