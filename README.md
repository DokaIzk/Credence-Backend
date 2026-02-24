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

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your actual values
```

The server **fails fast** on startup if any required environment variable is missing or invalid. See [Environment Variables](#environment-variables) below.

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

## Scripts

| Command              | Description                  |
|----------------------|------------------------------|
| `npm run dev`        | Start with tsx watch         |
| `npm run build`      | Compile TypeScript           |
| `npm start`          | Run compiled `dist/`         |
| `npm run lint`       | Run ESLint                   |
| `npm test`           | Run tests (vitest)           |
| `npm run test:watch` | Run tests in watch mode      |
| `npm run test:coverage` | Run tests with coverage   |

## API (current)

| Method | Path               | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/health`      | Health check       |
| GET    | `/api/trust/:address` | Trust score (stub) |
| GET    | `/api/bond/:address`   | Bond status (stub) |

## Configuration

The config module (`src/config/index.ts`) centralizes all environment handling:

- Loads `.env` files via [dotenv](https://github.com/motdotla/dotenv) for local development
- Validates **all** environment variables at startup using [Zod](https://zod.dev)
- Fails fast with a clear error message listing every invalid or missing variable
- Exports a fully typed `Config` object consumed by the rest of the application

### Usage

```ts
import { loadConfig } from './config/index.js'

const config = loadConfig()
console.log(config.port)          // number
console.log(config.db.url)        // string
console.log(config.features)      // { trustScoring: boolean, bondEvents: boolean }
```

For testing, use `validateConfig()` which throws a `ConfigValidationError` instead of calling `process.exit`:

```ts
import { validateConfig, ConfigValidationError } from './config/index.js'

try {
  const config = validateConfig({ DB_URL: 'bad' })
} catch (err) {
  if (err instanceof ConfigValidationError) {
    console.error(err.issues) // Zod issues array
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server port (1–65535) |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `LOG_LEVEL` | No | `info` | `debug`, `info`, `warn`, or `error` |
| `DB_URL` | **Yes** | — | PostgreSQL connection URL |
| `REDIS_URL` | **Yes** | — | Redis connection URL |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (≥ 32 chars) |
| `JWT_EXPIRY` | No | `1h` | JWT token lifetime |
| `ENABLE_TRUST_SCORING` | No | `false` | Enable trust scoring feature |
| `ENABLE_BOND_EVENTS` | No | `false` | Enable bond event processing |
| `HORIZON_URL` | No | — | Stellar Horizon API URL |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origin |

## Tech

- Node.js
- TypeScript
- Express
- Zod (env validation)
- dotenv (.env file support)
- Vitest (testing)

Extend with PostgreSQL, Redis, and Horizon event ingestion when implementing the full architecture.
