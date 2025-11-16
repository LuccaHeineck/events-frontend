# Event Manager — Frontend

> Frontend web application for the Event Manager project. Built with React + TypeScript and Vite.

## Principais tecnologias

- React
- TypeScript
- Vite (dev server / build)
- shadcn-style components (local `src/components/ui`)
- sonner (toasts)
- lucide-react (icons)

## Pré-requisitos

- Node.js (16+ recommended)
- npm (ou yarn/pnpm)

## Instalação

Abra um terminal na raiz do projeto e rode:

```powershell
npm install
```

## Rodando em desenvolvimento

```powershell
# inicia o dev server (Vite)
npm run dev
```

O app será servido por padrão em `http://localhost:3000` ou na próxima porta livre (o terminal informa a URL).

## Configurar o backend (Gateway)

O frontend espera que a variável `GATEWAY_URL` em `src/lib/api/config.ts` aponte para o seu gateway/backend. Exemplo:

```ts
export const GATEWAY_URL = 'http://123.12.123.12:1234';
```

Após alterar, reinicie o dev server.

## Credenciais de teste

No componente de login há credenciais de teste exibidas como exemplo. Um par comum usado no projeto é:

- Admin: `admin@gmail.com` / `admin`

## Build para produção

```powershell
npm run build
```

  
