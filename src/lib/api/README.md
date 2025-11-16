# API Client - Event Manager

## 🔧 Configuração

Para alterar a URL do backend, edite o arquivo `/lib/api/config.ts`:

```typescript
export const GATEWAY_URL = 'http://localhost:8080';
```

## 📁 Estrutura

```
/lib/api/
├── config.ts         # Configuração do gateway e helper de requisições
├── auth.ts          # Autenticação (login, register, logout)
├── events.ts        # Gerenciamento de eventos
├── registrations.ts # Inscrições e check-ins
├── certificates.ts  # Certificados
├── emails.ts        # Envio de emails
├── users.ts         # Gerenciamento de usuários
├── dashboard.ts     # Dashboard e logs de sincronização
└── index.ts         # Exportações centralizadas
```

## 🔌 Endpoints Mapeados

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário

### Eventos
- `GET /eventos` - Listar todos os eventos
- `GET /eventos/:id` - Obter evento específico
- `POST /eventos` - Criar novo evento
- `PUT /eventos/:id` - Atualizar evento
- `DELETE /eventos/:id` - Deletar evento
- `GET /eventos/:id/estatisticas` - Estatísticas do evento (inventado)

### Inscrições
- `GET /eventos/inscricao/:userId` - Obter inscrições de um usuário
- `GET /eventos/:eventId/inscricoes` - Obter inscrições de um evento (inventado)
- `POST /eventos/inscricao` - Criar inscrição
- `PUT /eventos/inscricao/:id` - Cancelar inscrição
- `POST /eventos/inscricao/:id/checkin` - Fazer check-in (inventado)
- `POST /eventos/inscricao/checkin-rapido` - Check-in rápido (inventado)

### Certificados (Inventados)
- `GET /certificados` - Certificados do usuário logado
- `GET /certificados/usuario/:userId` - Certificados de um usuário
- `GET /certificados/:id` - Obter certificado específico
- `POST /certificados` - Gerar certificado
- `GET /certificados/verificar/:codigo` - Verificar autenticidade
- `GET /certificados/:id/download` - Baixar PDF

### Emails
- `POST /send-email` - Enviar email
- `POST /send-email/evento/:eventId` - Enviar para participantes (inventado)

### Usuários
- `GET /usuarios` - Listar todos os usuários
- `GET /usuarios/:id` - Obter usuário específico (inventado)
- `GET /usuarios/me` - Usuário logado (inventado)
- `PUT /usuarios/:id` - Atualizar usuário (inventado)
- `DELETE /usuarios/:id` - Deletar usuário (inventado)

### Dashboard & Logs (Inventados)
- `GET /dashboard/estatisticas` - Estatísticas gerais
- `GET /logs/sincronizacao` - Logs de sincronização
- `POST /logs/sincronizacao` - Criar log
- `PUT /logs/sincronizacao/:id` - Atualizar log
- `POST /logs/sincronizacao/processar` - Processar logs pendentes

## 💡 Uso

```typescript
import { login, getEvents, createRegistration } from './lib/api';

// Login
const response = await login({
  email: 'admin@gmail.com',
  senha: 'admin'
});

// Salvar token
localStorage.setItem('auth_token', response.token);

// Buscar eventos (token é enviado automaticamente)
const events = await getEvents();

// Criar inscrição
const registration = await createRegistration({
  id_usuario: 1,
  id_evento: 1
});
```

## 🔐 Autenticação

O token JWT é salvo automaticamente no `localStorage` como `auth_token` e incluído em todas as requisições subsequentes através do header `Authorization: Bearer {token}`.

## ⚠️ Notas

- Endpoints marcados como **(inventado)** foram criados seguindo o padrão dos endpoints fornecidos
- Ajuste-os conforme necessário quando implementar no backend
- Todos os tipos TypeScript estão definidos junto aos endpoints
- Erros de requisição são lançados como `Error` com a mensagem apropriada
