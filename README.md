# Hackathon Boilerplate

Boilerplate completo para hackathons com autenticação (local + OAuth), RBAC e arquitetura escalável.

## Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcrypt
- OAuth (Google + GitHub)
- Helmet + CORS

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS
- React Router DOM
- Axios + Context API

### DevOps
- Docker + Docker Compose

## Início Rápido

### 1. Clone e configure as variáveis de ambiente

```bash
cp .env.local .env
```

Edite o arquivo `.env` e configure:
- `JWT_SECRET`: Uma string segura para assinar os tokens
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: Credenciais do Google OAuth
- `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`: Credenciais do GitHub OAuth

### 2. Inicie os containers

```bash
docker-compose up -d
```

### 3. Execute as migrações do banco

```bash
docker-compose exec backend npx prisma migrate dev
```

### 4. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Configurando OAuth

### Google
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto e ative a API do Google+
3. Configure as credenciais OAuth 2.0
4. Adicione `http://localhost:3001/api/auth/google/callback` como URI de redirecionamento

### GitHub
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie um novo OAuth App
3. Configure a URL de callback: `http://localhost:3001/api/auth/github/callback`

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login local
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/github` - Iniciar OAuth GitHub

### Usuários (requer autenticação)
- `GET /api/users/me` - Perfil do usuário logado
- `GET /api/users` - Listar usuários (ADMIN)
- `GET /api/users/:id` - Buscar usuário (ADMIN)
- `POST /api/users` - Criar usuário (ADMIN)
- `PUT /api/users/:id` - Atualizar usuário (ADMIN)
- `DELETE /api/users/:id` - Remover usuário (ADMIN)

## Árvore de Diretórios

```
hackathon-boilerplate/
├── docker-compose.yml
├── .env.local
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── server.ts
│       │
│       ├── config/
│       │   ├── database.ts
│       │   └── env.ts
│       │
│       ├── middlewares/
│       │   ├── index.ts
│       │   ├── checkAuth.ts
│       │   └── checkRole.ts
│       │
│       └── modules/
│           ├── auth/
│           │   ├── auth.controller.ts
│           │   ├── auth.routes.ts
│           │   └── auth.service.ts
│           │
│           └── users/
│               ├── users.controller.ts
│               ├── users.routes.ts
│               └── users.service.ts
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    │
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        │
        ├── contexts/
        │   └── AuthContext.tsx
        │
        ├── services/
        │   └── api.ts
        │
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx
            └── AuthCallback.tsx
```

## Licença

MIT
