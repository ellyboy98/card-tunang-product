# 07 Deployment (Vercel)

One deployment = one event. To run a second event, fork the repo and repeat with a new database.

There are two ways to do this. Both end in the same place: `main` → Production, `development` → Preview, migrations applied, admin reachable.

## Option A: Vercel CLI, run by Claude Code (recommended)

Everything is scriptable; the owner only supplies the admin password and clicks Create for the two storage products if the CLI cannot create them. The CLI runs from the app container so nothing is installed on the host.

### Authentication
Claude Code already has Vercel access. If a `VERCEL_TOKEN` is available, pass `--token "$VERCEL_TOKEN"` to every `vercel` command below (or export it in the container's environment) and skip login. If the Vercel MCP is connected instead, use its tools for the same steps (create project, connect git, add env vars, list deployments) and fall back to the CLI only for `env pull` and migrations. Only if neither is present, run `docker compose exec app npx vercel login` and let the owner complete the browser prompt.

### Then, by Claude Code
```bash
# 1. Link the repo to a new Vercel project (creates it if missing)
docker compose exec app npx vercel link --yes --project kad-tunang

# 2. Connect the GitHub repo so main/development deploy automatically
docker compose exec app npx vercel git connect

# 3. Create storage. These open the dashboard on first use; the owner clicks Create once each.
#    Neon (Postgres): Vercel dashboard → Storage → Create Database → Neon → attach to kad-tunang (all environments)
#    Blob:            Vercel dashboard → Storage → Create → Blob → attach to kad-tunang (all environments)
#    Both inject DATABASE_URL and BLOB_READ_WRITE_TOKEN automatically.
#    Try the API/MCP first; only ask the owner to click if creation isn't possible programmatically.

# 4. Set the remaining env vars for Production and Preview
SECRET=$(openssl rand -hex 32)
for ENV in production preview; do
  printf '%s' "$ADMIN_PASSWORD_FROM_OWNER" | docker compose exec -T app npx vercel env add ADMIN_PASSWORD $ENV
  printf '%s' "$SECRET"                   | docker compose exec -T app npx vercel env add ADMIN_SECRET $ENV
  printf '%s' "vercel-blob"               | docker compose exec -T app npx vercel env add STORAGE_DRIVER $ENV
done
printf '%s' "https://kad-tunang.vercel.app" | docker compose exec -T app npx vercel env add NEXT_PUBLIC_SITE_URL production
printf '%s' "https://kad-tunang-git-development.vercel.app" | docker compose exec -T app npx vercel env add NEXT_PUBLIC_SITE_URL preview

# 5. Pull the injected DATABASE_URL and run migrations against Neon
docker compose exec app npx vercel env pull .env.vercel --environment production
docker compose exec app sh -c 'set -a; . ./.env.vercel; set +a; npm run db:migrate'
rm -f .env.vercel   # never commit this

# 6. Deploy
git push origin development        # → preview URL printed by Vercel bot / `vercel ls`
# after owner approval:
git switch main && git merge --ff-only development && git push origin main   # → production
```

Claude Code must ask the owner for `ADMIN_PASSWORD_FROM_OWNER` rather than inventing one, and must not print it back.

Verify: `docker compose exec app npx vercel ls` shows both deployments Ready. Open `https://kad-tunang.vercel.app/admin`, log in, save the Kad tab once, add one household, open `/`, confirm the dropdown shows it.

## Option B: Dashboard only

1. Push the repo to GitHub with `main` and `development` branches.
2. Vercel → Add New → Project → import. Framework: Next.js. Production branch: `main` (Settings → Git).
3. Storage → Create Database → Neon; Storage → Create → Blob. Attach both.
4. Settings → Environment Variables (Production and Preview): `ADMIN_PASSWORD`, `ADMIN_SECRET` (`openssl rand -hex 32`), `STORAGE_DRIVER=vercel-blob`, `NEXT_PUBLIC_SITE_URL`.
5. Deploy. Apply migrations once:
   ```bash
   docker compose run --rm -e DATABASE_URL="<Neon pooled URL from Vercel>" app npm run db:migrate
   ```
6. Open `/admin`, configure, add guests.

## Migrations on every deploy (optional, after the first release)

Add to `package.json`:
```json
"vercel-build": "drizzle-kit migrate && next build"
```
Vercel runs this instead of `build`. Migrations then apply automatically on every push to `main` and `development`. Safe because migrations are committed files and Drizzle skips ones already applied. Enable this only after the first manual migration has succeeded.

## Custom domain

Vercel → Settings → Domains → add. Update `NEXT_PUBLIC_SITE_URL` for Production and redeploy. Something like `aisyah-hafiz.example.com` reads well in a WhatsApp message.

## Sharing the link

WhatsApp shows the Open Graph preview: title `"{title} · {first_name} & {second_name}"`, description the venue name, image `background_url` if set. Upload a background even at low card opacity so the preview has an image.

## Operational notes

- Rotating the admin password: `vercel env rm ADMIN_PASSWORD production` then `env add`, redeploy. Sessions stay valid until `ADMIN_SECRET` is also rotated.
- Backups: Neon free tier keeps 24 h point-in-time history. Before the event, download the CSV from admin.
- After the event: leave it up (countdown switches to "Terima kasih atas kehadiran"), or untick RSVP in admin to freeze the list.
- Costs: Neon free tier, Blob free tier, Vercel Hobby are enough for one event.
