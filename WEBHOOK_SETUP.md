# Configuração de Webhook para Desenvolvimento Local

## 🚨 Problema Identificado

O PagSeguro não aceita URLs locais (`http://localhost:3333`) para webhooks. O erro retornado é:

```json
{
  "error_messages": [
    {
      "code": "40002",
      "description": "invalid notification url",
      "parameter_name": "notification_urls[0]"
    }
  ]
}
```

## ✅ Soluções Implementadas

### 1. **Solução Automática (Recomendada)**

O código foi modificado para detectar automaticamente se está rodando em localhost e **não enviar** a URL de notificação nesses casos:

```typescript
// Em src/services/pag-seguro.ts
...(env.APP_URL.includes('localhost') ? {} : { notification_urls: [`${env.APP_URL}/webhook/pagseguro`] })
```

**Como funciona:**
- ✅ Se `APP_URL` contém "localhost" → **não envia** notification_urls
- ✅ Se `APP_URL` é uma URL pública → **envia** notification_urls normalmente

### 2. **Para Testes com Webhook (Opcional)**

Se você quiser testar os webhooks em desenvolvimento local, você pode usar ferramentas como ngrok ou similar para criar um túnel público para sua aplicação local.

**Alternativas para desenvolvimento local:**
- **ngrok**: https://ngrok.com
- **localtunnel**: https://localtunnel.github.io/www/
- **serveo**: https://serveo.net/

**Exemplo com ngrok:**
```bash
# 1. Instale o ngrok
# 2. Execute: ngrok http 3333
# 3. Use a URL fornecida no seu .env
APP_URL=https://abc123.ngrok.io
```

## 🔄 Fluxo de Desenvolvimento

### **Desenvolvimento Local (Sem Webhook)**
1. ✅ Mantenha `APP_URL=http://localhost:3333` no .env
2. ✅ Os pagamentos PIX/Cartão funcionam normalmente
3. ✅ Para verificar status, use: `GET /payment/status/:orderId`
4. ⚠️ Webhooks não funcionam (mas não são necessários para desenvolvimento)

### **Desenvolvimento com Webhook**
1. 🔧 Configure uma ferramenta de túnel (ngrok, localtunnel, etc.)
2. 🔧 Atualize `APP_URL` com a URL pública fornecida
3. ✅ Webhooks funcionam normalmente
4. ✅ Notificações automáticas de pagamento

### **Produção**
1. ✅ Use URL pública real no `APP_URL`
2. ✅ Webhooks funcionam automaticamente
3. ✅ Sistema completo de notificações

## 🧪 Testando Pagamentos

### Teste PIX (Funciona em localhost)
```bash
curl -X POST http://localhost:3333/pay/pix \
  -H "Content-Type: application/json" \
  -d '{
    "reference_id": "teste-123",
    "name": "Teste PIX",
    "quantity": 1,
    "unit_amount": 10.00
  }'
```

### Teste Cartão (Funciona em localhost)
```bash
curl -X POST http://localhost:3333/pay/card \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid-do-pedido",
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

### Verificar Status (Sempre funciona)
```bash
curl http://localhost:3333/payment/status/uuid-do-pedido
```

## 📝 Notas Importantes

1. **Desenvolvimento Local**: Webhooks não são necessários para desenvolvimento básico
2. **Verificação Manual**: Use o endpoint `/payment/status/:orderId` para verificar pagamentos
3. **Produção**: Webhooks são essenciais para notificações automáticas
4. **Segurança**: Em produção, implemente validação de assinatura do webhook

## 🚀 Próximos Passos

1. ✅ Teste os pagamentos PIX e Cartão
2. ✅ Verifique se os pedidos são criados corretamente
3. 🔧 Configure uma ferramenta de túnel apenas se precisar testar webhooks
4. 🚀 Em produção, use URL pública real
