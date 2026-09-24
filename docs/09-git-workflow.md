# 09 Git workflow

Two long-lived branches. Vercel deploys both automatically once the repo is connected.

| Branch | Purpose | Vercel environment | URL |
|---|---|---|---|
| `main` | What guests see. Only receives merges from `development`; a `vX.Y.Z` tag on it triggers the release pipeline that deploys. | Production (via `release.yml`) | custom domain / `<project>.vercel.app` |
| `development` | Day-to-day work. Every phase in `docs/08` lands here first. | Preview | `<project>-git-development-<team>.vercel.app` |

Preview and Production share the same Neon database and Blob store in v1 (one event, one admin, low risk). If that ever bites, create a second Neon branch for Preview; do not build anything for it now.

## Rules for Claude Code

1. Never commit directly to `main`. All work happens on `development` (or a short-lived branch off it, merged back with a fast-forward or squash).
2. One commit per logical change, Conventional Commits style: `feat(card): countdown with day boundary in KL time`, `fix(rsvp): clamp pax to allocation`, `chore(docker): add uploads volume`, `docs: …`. Subject ≤ 72 chars, imperative, no trailing period. Body explains why when the diff doesn't.
3. Commit at the end of every phase at minimum; more often is fine. Each commit must pass `typecheck`, `lint`, and `test` inside the container.
4. Push `development` after every phase so the preview URL reflects it. Tell the owner the preview URL.
5. Merge to `main` only when the owner says so. Use `git merge --ff-only development` from `main`, or open a pull request if the owner prefers to click merge. Never rebase or force-push `main`.
6. Tag releases on `main`: `v0.1.0` for the first deploy that goes to guests, patch bumps after. The tag is what deploys: pushing it starts the Release workflow (`docs/07` → Releases), which waits for the owner's approval before touching production.
7. Never commit `.env*` files (other than `.env.example`), `node_modules`, `.next`, or anything under `public/uploads/`.

## Setup (Phase 0)

```bash
git init -b main
git add .
git commit -m "chore: scaffold from build specification"
git branch development
git switch development
# create the GitHub repo first (private), then:
git remote add origin git@github.com:<owner>/kad-tunang.git
git push -u origin main
git push -u origin development
```

Set `development` as the default branch on GitHub (Settings → General → Default branch) so pull requests target it by default.

## Merging to production

```bash
git switch development && git pull
docker compose exec app sh -c "npm run typecheck && npm run lint && npm test"
git switch main && git pull
git merge --ff-only development
git tag -a v0.1.0 -m "First guest-facing release"
git push origin main --tags
git switch development
```

Pushing the tag starts the Release workflow: checks, then a deploy step that waits for approval under Actions. Approve it and Vercel promotes the build to Production. If anything fails, Production keeps the previous deployment; fix on `development`, merge again, and push a new patch tag.

## Hotfix

Branch from `main`, fix, merge to `main`, then merge `main` back into `development` so the branches don't drift. Rare for a project this size; prefer fixing on `development` and merging forward.
