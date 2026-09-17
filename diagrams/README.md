# Diagrams

Both diagrams are native draw.io files. Open them in draw.io Desktop, VS Code (Draw.io Integration extension), or via the editable links below (the whole diagram is encoded in the URL; nothing is uploaded).

- `erd.drawio`: tables, columns, types, enums. Same content as `docs/03-data-model.md`.
- `architecture.drawio`: clients, Next.js layers, Postgres, Blob. Same content as the Mermaid diagram in `docs/02-architecture.md`.

Editable links: `erd.drawio.url.txt`, `architecture.drawio.url.txt`.

Both sources pass the geometry linter with 0 errors. The two warnings on `architecture.drawio` are the linter's straight-line heuristic for edges that leave the Vercel container from its right edge; the rendered edges do not cross the middleware box. PNG/SVG exports were not produced in the authoring environment (no draw.io CLI available); export from any of the tools above if you need images.
