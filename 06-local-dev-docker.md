# 06 Local development with Docker

Requirement on the host: Docker Desktop (or Docker Engine + Compose v2). Nothing else. Node, npm, and Postgres run inside containers. `node_modules` lives in a named volume so the host filesystem stays clean and installs are fast on macOS/Windows.

## Files to create at the repo root

### `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - uploads:/app/public/uploads
    environment:
      DATABASE_URL: postgres://kad:kad@db:5432/kad_tunang
      STORAGE_DRIVER: local
      ADMIN_PASSWORD: admin
      ADMIN_SECRET: dev-secret-change-in-prod
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
      WATCHPACK_POLLING: "true"   # reliable file watching on Docker Desktop
    depends_on:
      db:
        condition: service_healthy
    command: sh -c "npm install && npm run db:migrate && npm run dev"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: kad
      POSTGRES_PASSWORD: kad
      POSTGRES_DB: kad_tunang
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kad -d kad_tunang"]
      interval: 3s
      timeout: 3s
      retries: 10

volumes:
  node_modules:
  uploads:
  pgdata:
```

### `Dockerfile.dev`

```dockerfile
FROM node:22-alpine
WORKDIR /app
# Dependencies are installed by the compose command so a package.json change
# doesn't require a rebuild. This image only provides Node.
EXPOSE 3000
```

### `.dockerignore`

```
node_modules
.next
.git
.env*
```

### `package.json` scripts (relevant part)

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio --host 0.0.0.0"
  }
}
```

## Daily use

```bash
docker compose up            # first run: installs deps, migrates, starts Next on :3000
docker compose exec app npm run typecheck
docker compose exec app npm run lint
docker compose exec app npm test
docker compose exec app npm run db:generate   # after editing schema.ts
docker compose exec app npm run db:migrate
docker compose exec app npm run db:studio     # Drizzle Studio at http://localhost:4983
docker compose down          # keep data
docker compose down -v       # wipe database and uploads
```

Admin at http://localhost:3000/admin, password `admin`.

## Local file storage

With `STORAGE_DRIVER=local`, uploads are written to `public/uploads/{kind}/{timestamp}.{ext}` inside the container (persisted in the `uploads` volume) and served by Next at `/uploads/…`. The `StorageAdapter` interface is:

```ts
// src/server/storage/storage.ts
export interface StorageAdapter {
  put(path: string, file: File): Promise<{ url: string }>;
}
```

`LocalDiskStorage.put` writes the file with `fs/promises` and returns `${NEXT_PUBLIC_SITE_URL}/uploads/${path}`. `VercelBlobStorage.put` calls `@vercel/blob` `put()` with `access: "public"`. `index.ts` picks one from `STORAGE_DRIVER`. That is the entire abstraction; do not add list/delete until something needs them.

## Adding a dependency

```bash
docker compose exec app npm install <pkg>
```
The `node_modules` volume updates in place; `package.json` and the lockfile change on the host through the bind mount.

## Why not a production Dockerfile

The production target is Vercel, which builds from the repo directly. A production Dockerfile would be a second deployment path to maintain for no user. If someone later wants to self-host, add a multi-stage `Dockerfile` with `output: "standalone"` then.
