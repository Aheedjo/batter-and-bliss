# Batter & Bliss

Customer-facing site and order flow for **Batter & Bliss** (landing, build-your-own pancake journey, checkout). Admin tools manage menu add-ons backed by **Prisma** and **SQLite**.

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** 3
- **Prisma** 6 + SQLite (`DATABASE_URL`)
- **Zustand** for client order state, **Zod** for validation, **react-hook-form** where forms need it

## Prerequisites

- Node.js 20+ (recommended)
- npm (or compatible client)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` as needed (see [Environment variables](#environment-variables)).

3. Database:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

   For a quick local file without migrations, you can use `npm run db:push` instead of `db:migrate`, then seed.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server (Turbopack) at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:push` | Push schema to DB (prototyping) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Run `prisma/seed.cjs` |

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string, e.g. `file:./dev.db` (path is relative to the `prisma/` folder) |
| `NEXT_PUBLIC_BANK_NAME` | No | Bank name on checkout / tracking (browser-exposed) |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` | No | Account number shown to customers |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | No | Account name shown to customers |
| `ADMIN_BASIC_AUTH_USER` | No* | HTTP Basic Auth username for `/admin` |
| `ADMIN_BASIC_AUTH_PASSWORD` | No* | HTTP Basic Auth password for `/admin` |

\*If **both** admin variables are set, all `/admin` routes require Basic Auth. If either is missing, `/admin` is not protected by middleware—set both in production when exposing admin publicly.

See `.env.example` for notes and placeholders.

## App routes (overview)

- **`/`** — Marketing / landing
- **`/order/*`** — Order flow (stack, customize, toppings, syrups, drinks, note, checkout, confirmation, etc.)
- **`/admin`** — Overview dashboard (catalog counts)
- **`/admin/menu`** — CRUD-style management of **toppings** (glazing / topping / syrup / drink) and **extras**; availability toggles
- **`/admin/orders`** — Placeholder until order persistence and APIs exist

## Project layout (high level)

- `app/` — Routes, layouts, server actions (e.g. `app/admin/menu/actions.ts`)
- `components/` — UI (brand, order steps, admin, landing)
- `lib/` — DB client, auth helpers, order logic, validations, stores
- `prisma/` — `schema.prisma`, migrations, seed

## Quality checks before deploy

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). Set bank `NEXT_PUBLIC_*` values and admin Basic Auth if the admin UI is exposed.

### Database on Vercel (and other serverless hosts)

The repo’s default **SQLite** file (`prisma/*.db`) is **not** committed (see `.gitignore`), and serverless runtimes are a poor fit for a local file database. If `DATABASE_URL` is missing or points at a non-existent file, Prisma would throw on routes that load the menu (e.g. `/order/customize`).

**Customer order pages** use `lib/data/toppings-public.ts`: on any database error they **fall back** to the baked-in catalog in `lib/data/default-menu.json`, so the storefront keeps working even without a live DB.

**Admin** (`/admin/*`) still needs a working `DATABASE_URL`. For production, point Prisma at a hosted database ([Prisma Postgres](https://www.prisma.io/docs/postgres), [Turso](https://docs.turso.tech/), [Neon](https://neon.tech/), etc.), run migrations and seed there, and set `DATABASE_URL` in the host’s environment.
