# Credence Backend

API and services for the Credence economic trust protocol. Provides health checks, trust score and bond status endpoints (to be wired to Horizon and a reputation engine).

## About

This service is part of [Credence](../README.md). It will support:

- Public query API (trust score, bond status, attestations)
- Horizon listener for bond/slash events (future)
- Reputation engine (off-chain score from bond data) (future)

## Prerequisites

- Node.js 18+
- npm or pnpm
- Docker & Docker Compose (for containerised dev)

## Setup

```bash
npm install
```

## Run locally

**Development (watch mode):**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

API runs at [http://localhost:3000](http://localhost:3000). The frontend proxies `/api` to this URL.

---

## Docker (recommended for local dev)

The project ships with **Dockerfile**, **docker-compose.yml**, and an example env file so you can spin up the full stack (API + PostgreSQL + Redis) in one command.

### Quick start

```bash
# 1. Create your local env file
cp .env.example .env

# 2. Build and start all services
docker compose up --build

# 3. Verify health
curl http://localhost:3000/api/health
# → {"status":"ok","service":"credence-backend"}
```

### Services

| Service    | Port  | Description                  |
|------------|-------|------------------------------|
| `backend`  | 3000  | Express / TypeScript API     |
| `postgres` | 5432  | PostgreSQL 16                |
| `redis`    | 6379  | Redis 7                     |

All ports are configurable via `.env` (see `.env.example`).

### Seeding the database

Drop any `.sql` files into the `init-db/` directory. PostgreSQL will execute them **once** when the data volume is first created. A placeholder file (`init-db/001_schema.sql`) is included as a starting point.

To re-run init scripts, remove the volume and restart:

```bash
docker compose down -v   # removes data volumes
docker compose up --build
```

### Useful commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (reset DB/Redis data)
docker compose down -v

# View logs
docker compose logs -f backend

# Rebuild only the backend image
docker compose build backend

# Open a psql shell
docker compose exec postgres psql -U credence
```

### Environment variables

All configuration is driven by environment variables. Copy `.env.example` to `.env` and adjust as needed. Key variables:

| Variable            | Default     | Description                |
|---------------------|-------------|----------------------------|
| `PORT`              | `3000`      | Backend listen port        |
| `POSTGRES_USER`     | `credence`  | PostgreSQL user            |
| `POSTGRES_PASSWORD` | `credence`  | PostgreSQL password        |
| `POSTGRES_DB`       | `credence`  | PostgreSQL database name   |
| `POSTGRES_PORT`     | `5432`      | Host-exposed PG port       |
| `REDIS_PORT`        | `6379`      | Host-exposed Redis port    |
| `DATABASE_URL`      | (composed)  | Full PG connection string  |
| `REDIS_URL`         | (composed)  | Full Redis connection URL  |

---

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start with tsx watch     |
| `npm run build` | Compile TypeScript       |
| `npm start`     | Run compiled `dist/`     |
| `npm run lint`  | Run ESLint               |

## API (current)

| Method | Path               | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/health`      | Health check       |
| GET    | `/api/trust/:address` | Trust score (stub) |
| GET    | `/api/bond/:address`   | Bond status (stub) |

## Tech

- Node.js
- TypeScript
- Express

Extend with PostgreSQL, Redis, and Horizon event ingestion when implementing the full architecture.
