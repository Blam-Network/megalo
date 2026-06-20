# Development

From the repository root:

```bash
npm install
npm run validate   # test, typecheck, docs build
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run docs:highlight` | Bundle Megalo syntax highlighter for VitePress |
| `npm run docs` | VitePress dev server |
| `npm run docs:build` | Production docs site |
| `npm run docs:preview` | Preview built docs |
| `npm test` | Run unit tests (excludes `tests/local/**`) |
| `npm run test:local` | Local integration tests (fixtures, game installs) |
| `npm run build` | Compile ESM `dist/` and CJS `dist-cjs/` |
| `npm run typecheck` | TypeScript check |

## Docs site

User guide: VitePress in `docs/` (same layout as [@blamnetwork/blf](https://blam-network.github.io/blf/)).

Version pages, action pages, and sidebar metadata (`docs/.vitepress/language-versions.json`, `language-actions.json`, `megalo-highlight-vocabulary.json`) are maintained manually in the repo — there is no blf-driven doc generator.

CI deploys the VitePress site to GitHub Pages on pushes to `main`.

## Linking local blf

While developing against an unpublished `@blamnetwork/blf` build:

```bash
npm run link:blf
# ... work ...
npm run unlink:blf
```
