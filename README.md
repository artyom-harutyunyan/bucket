# Bucket

Simple Next.js app to manage **categories** and **items** with PostgreSQL. One user signs in with credentials from environment variables.

## Features

- Password-protected single-user login
- Categories: create, edit, delete
- Items: title, description, source, optional image (stored in DB, max 10MB)
- Many-to-many item ↔ categories
- Items list and per-category list with search (title/description) and pagination (20 per page)
- Mobile-friendly neutral UI
- Ready for [Vercel](https://vercel.com) + [Supabase](https://supabase.com) Postgres

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL`, `APP_USERNAME`, `APP_PASSWORD`, and `AUTH_SECRET` in `.env`.

   **`DATABASE_URL` must be `postgresql://…`** — not `prisma+postgres://`.  
   If you use **Supabase**, copy the URI from **Project Settings → Database → Connection string**.  
   If `.env` still has the default `prisma+postgres://` line from `prisma init`, replace it.

3. Install and sync the database schema:

```bash
npm install
npm run db:deploy
```

For **Supabase**, set both in `.env`:

- `DATABASE_URL` — transaction pooler (port **6543**, `?pgbouncer=true`) for the app
- `DIRECT_URL` — session pooler or direct (port **5432**) for migrations

`npm run db:deploy` applies migrations using `DIRECT_URL`.

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Supabase

1. Create a project in Supabase.
2. Copy the **Connection string** (URI) into `DATABASE_URL` on Vercel and locally. Use the pooled connection string for serverless if you prefer.
3. Run `npx prisma migrate deploy` against that database (locally with the same `DATABASE_URL`, or via CI).

## Deploy on Vercel

1. Push the repo to GitHub and import the project in Vercel.
2. Add environment variables: `DATABASE_URL`, `APP_USERNAME`, `APP_PASSWORD`, `AUTH_SECRET`.
3. Deploy. The `postinstall` script runs `prisma generate` automatically.
4. After the first deploy, run migrations once against production:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx prisma migrate dev` | Apply migrations in development |
| `npx prisma studio` | Browse data |
