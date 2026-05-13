# Batter & Bliss

Customer-facing site and order flow for **Batter & Bliss** (landing, build-your-own pancake journey, checkout). Admin tools manage menu add-ons backed by **Prisma** and **PostgreSQL**.

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** 3
- **Prisma** 6 + PostgreSQL (`DATABASE_URL`, e.g. Neon)
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
| `npm run typecheck` | `prisma generate` then `tsc --noEmit` (keeps Prisma types in sync) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:push` | Push schema to DB (prototyping) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Run `prisma/seed.cjs` |

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL URL (e.g. Neon), e.g. `postgresql://…?sslmode=require` |
| `NEXT_PUBLIC_BANK_NAME` | No | Bank name on checkout / tracking (browser-exposed) |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` | No | Account number shown to customers |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | No | Account name shown to customers |
| `ADMIN_USER` | No | Username for `/admin/login` (defaults to `admin`) |
| `ADMIN_PASSWORD` | No* | Password for admin login; session cookie after sign-in |
| `ADMIN_JWT_PEPPER` | No | Optional extra secret mixed into session signing |
| `ADMIN_BASIC_AUTH_*` | No | Legacy only: still read as fallback if `ADMIN_PASSWORD` / `ADMIN_USER` are unset |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Enables Google Places address suggestions on checkout; enable Maps JavaScript API + Places API and restrict the key by HTTP referrer |
| `NEXT_PUBLIC_GOOGLE_PLACES_COUNTRY` | No | Comma-separated ISO country codes for suggestion bias (defaults to `ng`). Set to `all` to disable the country filter |

\*If **`ADMIN_PASSWORD`** (or legacy **`ADMIN_BASIC_AUTH_PASSWORD`**) is set, `/admin` (except `/admin/login`) requires a signed-in session. If no admin password env is set, `/admin` is open—only for trusted local dev.

See `.env.example` for notes and placeholders.

## App routes (overview)

- **`/`** — Marketing / landing
- **`/order/*`** — Order flow (stack, customize, toppings, syrups, drinks, note, checkout, confirmation, etc.)
- **`/admin/login`** — Admin sign-in (when `ADMIN_PASSWORD` is set)
- **`/admin`** — Overview dashboard
- **`/admin/menu`** — CRUD-style management of **toppings** (glazing / topping / syrup / drink) and **extras**; availability toggles
- **`/admin/orders`** — Order queue from the database: filters (all / pending / confirmed / rejected), grouped by day, **Accept** / **Reject** (with customer-facing reason)

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

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). Set bank `NEXT_PUBLIC_*` values, `DATABASE_URL`, and **`ADMIN_PASSWORD`** (plus optional `ADMIN_USER`) if the admin UI is exposed.

### Database on Vercel (and other serverless hosts)

The app uses **PostgreSQL** (e.g. [Neon](https://neon.tech/)). Run `npx prisma migrate deploy` (and optional `db seed`) on the host. Set `DATABASE_URL` in the host’s environment.

Checkouts are saved to the **`Order`** table so `/admin/orders` can list them. After `git pull`, run `npx prisma migrate deploy` (or `db push` in dev) so the schema includes `Order`.
