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

Version pages, action pages under `docs/language/actions/`, and sidebar metadata (`docs/.vitepress/language-versions.json`, `language-actions.json`, `megalo-highlight-vocabulary.json`, `action-context-grammar.json`) are **hand-authored** in the repo. No script generates or overwrites action markdown — edit those `.md` files directly.

`npm run predocs` only bundles the syntax highlighter; it does not touch action pages.

To refresh action operand names from HREK ManagedMegalo.dll:

```bash
python scripts/extract-action-context-grammar.py
```

CI deploys the VitePress site to GitHub Pages on pushes to `main`.

## Linking local blf

While developing against an unpublished `@blamnetwork/blf` build:

```bash
npm run link:blf
# ... work ...
npm run unlink:blf
```
