# Sender til Svalbard

A SvelteKit directory for companies that ship goods to Svalbard, whether they refund VAT, and practical ordering notes.

## Local setup

```bash
pnpm install
pnpm dev
```

The app applies the SQLite migrations automatically on start. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before first start to create the first backoffice user.

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-me' pnpm dev
```

You can also seed an admin explicitly:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-me' pnpm seed
```

## Schema workflow

When you change the database shape, update the table definitions in `src/lib/server/db/schema.ts` first. If you remove a column or rename a property, also remove or update every code path that still reads it.

Then generate a migration and commit it:

```bash
pnpm db:generate
```

For production releases, ship the migration file together with the code change. On startup, the app runs the pending Drizzle migrations automatically, so the database is updated as part of the release. If you prefer to apply changes manually before deployment, run:

```bash
pnpm db:migrate
```

Avoid changing the database structure directly in `src/lib/server/db.ts`; that file should stay focused on connection setup and query helpers.

## Docker

```bash
docker compose up --build
```

The SQLite database is stored in `./data`.

## Import old Google Sheets data

Place the exported CSV at `scripts/old-sheet.csv`, then run:

```bash
pnpm import:old-sheet
```

In Docker/Coolify, this file is copied into the image at `/app/scripts/old-sheet.csv`. The import uses `DB_PATH`, so with the provided compose file it writes to `/app/data/svalbard.sqlite`. The import script runs with plain Node and only needs production dependencies.
