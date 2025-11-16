# Status da Integração com Backend

## ✅ Endpoints Integrados

### 🔐 Autenticação
- **POST /auth/login** - Login integrado no `AuthContext`
- **POST /auth/register** - Registro integrado no `AuthContext`

### 📅 Eventos
- **GET /eventos** - Integrado em:
  - `EventsPage` (usuário comum)
  - `DashboardPage` (admin)
  - `ManageEventsPage` (admin)
  - `EmailsPage` (admin)
- **POST /eventos** - Integrado em `ManageEventsPage`
- **GET /eventos/:id** - API disponível (não usado ainda)
- **PUT /eventos/:id** - Integrado em `ManageEventsPage`
- **DELETE /eventos/:id** - Integrado em `ManageEventsPage`

### 📝 Inscrições
- **GET /eventos/inscricao/:userId** - Integrado em `RegistrationsPage`
- **POST /eventos/inscricao** - API disponível (precisa integrar no modal de detalhes)
- **PUT /eventos/inscricao/:id** - Integrado em `RegistrationsPage` (cancelar)

### 📧 Emails
- **POST /send-email** - Integrado em `EmailsPage`

### 👥 Usuários
- **GET /usuarios** - Integrado em `DashboardPage`

---

## ⏳ Funcionalidades com Mock Data

### Páginas ainda usando dados mockados:
1. **CertificatesPage** - Certificados (aguardando endpoint de certificados)
2. **CheckInPage** - Check-in (aguardando endpoint de check-in)
3. **LogsPage** - Logs de sincronização (aguardando endpoint de logs)
4. **EventDetailsModal** - Modal de detalhes do evento (falta integrar POST /eventos/inscricao)

---

## 🎯 Próximos Passos para Integração Completa

### 1. Inscrição em Eventos
**Endpoint necessário:** `POST /eventos/inscricao`
- Arquivo: `/components/events/EventDetailsModal.tsx`
- Ação: Botão "Inscrever-se" precisa chamar a API real

### 2. Sistema de Check-in
**Endpoint necessário:** `POST /eventos/inscricao/:id/checkin` (ou similar)
- Arquivo: `/components/pages/admin/CheckInPage.tsx`
- Funcionalidade: Check-in manual e check-in rápido

### 3. Certificados
**Endpoints necessários:**
- `GET /certificados` ou `GET /certificados/usuario/:userId`
- `POST /certificados` (gerar certificado)
- Arquivo: `/components/pages/CertificatesPage.tsx`

### 4. Logs de Sincronização
**Endpoints necessários:**
- `GET /logs/sincronizacao`
- `POST /logs/sincronizacao/processar`
- Arquivo: `/components/pages/admin/LogsPage.tsx`

### 5. Estatísticas do Dashboard
**Endpoint sugerido:** `GET /dashboard/estatisticas`
- Retornar: total de inscrições, check-ins, certificados por evento
- Arquivo: `/components/pages/admin/DashboardPage.tsx`

---

## ⚙️ Configuração

**URL do Backend:** Configurada em `/lib/api/config.ts`
```typescript
export const GATEWAY_URL = 'http://localhost:8080';
```

**Autenticação:** Token JWT armazenado em `localStorage` como `auth_token`
- Enviado automaticamente em todas as requisições no header `Authorization: Bearer {token}`

---

## 🐛 Tratamento de Erros

Todas as páginas integradas possuem:
- ✅ Loading states
- ✅ Error alerts (componente Alert do shadcn/ui)
- ✅ Toast notifications para feedback ao usuário
- ✅ Try/catch com mensagens descritivas

---

## 📝 Observações Importantes

1. **Formato de Datas:** A API espera datas no formato `YYYY-MM-DD HH:MM:SS`
2. **IDs:** A API retorna IDs numéricos, mas o frontend ainda usa strings em alguns lugares (conversão aplicada onde necessário)
3. **Campos Opcionais:** `descricao` dos eventos é opcional na API
4. **Vagas:** API retorna `vagas_totais` e `vagas_disponiveis`

---

## 🔄 Mapeamento de Campos

### Evento (API → Frontend)
```
id → id (convertido para string)
titulo → title
descricao → description
data_inicio → startDate
data_fim → endDate
local → location
vagas_totais → totalSlots
vagas_disponiveis → availableSlots
```

### Inscrição (API → Frontend)
```
id → id
id_usuario → userId
id_evento → eventId
status → status
checked_in → checkedIn
evento → evento (objeto populado)
```

### Usuário (API → Frontend)
```
id → id (convertido para string)
nome → name
email → email
isAdmin → isAdmin
```
