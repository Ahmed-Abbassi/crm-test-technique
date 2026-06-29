# CRM Module Demo

A production-quality CRM module built with NestJS, Prisma, PostgreSQL, Next.js 14, and TypeScript.

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- pnpm (`npm install -g pnpm`)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/crm-module-demo-ahmed
cd crm-module-demo-ahmed

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL
docker-compose up -d

# 4. Set up the backend
cd apps/backend
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm start:dev

# 5. In a new terminal, set up the frontend
cd apps/frontend
pnpm install
pnpm dev
```

The backend runs on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://crm_user:crm_password@localhost:5432/crm_demo` | Prisma connection string |
| `PORT` | `3001` | Backend port |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Frontend → backend URL |

## Project Structure

```
crm-module-demo-ahmed/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── prisma/       # Schema, migrations, seed
│   │   └── src/          # Modules (clients, opportunities, common)
│   └── frontend/         # Next.js App Router
│       └── src/
│           ├── app/      # Routes (opportunities, clients, pipeline)
│           └── lib/      # API client, types
├── docker-compose.yml    # PostgreSQL
├── DECISIONS.md          # Architecture decisions
└── README.md
```

## Features

- **Client Management**: Create, update, delete, and search clients (companies and individuals)
- **Opportunity Management**: Full CRUD with stage tracking, problematic flag detection
- **Pipeline Dashboard**: Aggregated metrics with bar chart visualization
- **Problematic Detection**: Late and stagnant opportunity flags computed server-side
- **Pagination**: Server-side pagination on all list endpoints
- **Validation**: Client-side (zod) and server-side (class-validator) validation
- **Error Handling**: Consistent error envelopes, retry on failure, loading skeletons