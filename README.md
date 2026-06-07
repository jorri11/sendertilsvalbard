# Sender til Svalbard

A SvelteKit directory for companies that ship goods to Svalbard, whether they refund VAT, and practical ordering notes.

## Local setup

```bash
pnpm install
pnpm dev
```

The app creates the SQLite database automatically. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before first start to create the first backoffice user.

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-me' pnpm dev
```

You can also seed an admin explicitly:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-me' pnpm seed
```

## Docker

```bash
docker compose up --build
```

The SQLite database is stored in `./data`.

## Import old Google Sheets data

Place the exported CSV at `data/old-sheet.csv`, then run:

```bash
pnpm import:old-sheet
```

In Docker/Coolify, make sure the file exists at `/app/data/old-sheet.csv` inside the container. The import uses `DB_PATH`, so with the provided compose file it writes to `/app/data/svalbard.sqlite`. The import script runs with plain Node and only needs production dependencies.
