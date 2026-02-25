# Credence Backend

API and services for the Credence economic trust protocol. Provides health checks, trust score and bond status endpoints (to be wired to Horizon and a reputation engine).

## About

This service is part of [Credence](../README.md). It supports:

- Public query API (trust score, bond status, attestations)
- Horizon listener for bond withdrawal events
- Redis-based caching layer
- Reputation engine (off-chain score from bond data) (future)

## Prerequisites

- Node.js 18+
- npm or pnpm
- Redis server (for caching)
- Stellar Horizon server (for blockchain events)
- @stellar/stellar-sdk (Stellar blockchain integration)

## Setup

```bash
npm install
# Set Redis URL in environment
export REDIS_URL=redis://localhost:6379
# Set Horizon URL for blockchain events
export HORIZON_URL=https://horizon-testnet.stellar.org
# Set Stellar network passphrase
export STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
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

## Horizon Listener

The service includes a Horizon withdrawal events listener that:

- **Monitors Stellar blockchain** for withdrawal transactions affecting bonds
- **Updates bond states** (amount, active status) based on on-chain events
- **Creates score history snapshots** for significant withdrawals
- **Maintains consistency** between on-chain and database states
- **Handles errors gracefully** with automatic retry and recovery

See [docs/horizon-listener.md](./docs/horizon-listener.md) for detailed documentation.

## Tech

- Node.js
- TypeScript
- Express
- Redis (caching layer)
- @stellar/stellar-sdk (Stellar blockchain integration)
- Vitest (testing)

Extend with PostgreSQL and additional Horizon event ingestion when implementing the full architecture.
