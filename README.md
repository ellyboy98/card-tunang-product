# Kad Tunang

Mobile-first invitation card for a Malay engagement ceremony, with a password-protected admin panel for the guest list and card content. One deployment hosts one event.

The specification lives in `docs/` and is the source of truth. Start with `docs/01-overview.md`; `docs/08-implementation-plan.md` is the build order. Editable draw.io diagrams are in `diagrams/`.

## Run locally

Requires Docker only.

```bash
docker compose up            # installs deps, migrates, serves http://localhost:3000
docker compose exec app npm run typecheck
docker compose exec app npm run lint
docker compose exec app npm test
```

Admin at http://localhost:3000/admin, password `admin`. See `docs/06-local-dev-docker.md` for the rest.

## Deviations from the docs

Kept here so the docs stay the spec and the reasons stay findable.

- `Dockerfile.dev` runs as the image's `node` user and pre-creates the two volume mount points. The docs' three-line Dockerfile runs as root, which on Linux and WSL hosts leaves root-owned files in the bind mount. Behaviour is otherwise identical.
- `lint` runs `eslint` directly instead of `next lint`, which Next 15.5 deprecates. Same config, same rules.
- `@types/node` is `^22` (docs' scaffold gives `^20`) because Vitest 5 requires it and the container runs Node 22.
