# Scaffold · Core

Shared components, design system, content schema, KB registry, and reusable CI workflow for the [Scaffold](docs/scaffold-brief.md) family of knowledge bases — static, GitHub Pages-hosted sites that double as reference material and learning material.

Published as `@daanish02/scaffold-core`, shipped as **source** (`.astro`/`.ts`/`.tsx`/`.css`, no compiled `dist/`) so each KB's own Astro build compiles it in context.

License: **CC BY-NC-SA 4.0** (attribution required, no commercial use, derivatives carry the same terms).

## Install

```sh
bun add @daanish02/scaffold-core
```

## Usage

In a KB's `astro.config.ts`:

```ts
import { defineConfig } from "astro";
import { scaffold } from "@daanish02/scaffold-core/astro/integration";

export default defineConfig({
  integrations: [scaffold({ site: "https://daanish02.github.io", base: "/scaffold-math" })],
});
```

`scaffold()` wires up MDX, KaTeX (via remark-math/rehype-katex), React (for `.tsx` interactive components), and Pagefind search.

Import components directly from the package:

```mdx
import Callout from "@daanish02/scaffold-core/components/content/Callout.astro";
import TransformViz from "@daanish02/scaffold-core/components/interactive/TransformViz.tsx";
```

See [`docs/AUTHORING.md`](docs/AUTHORING.md) for the concept-page authoring pattern and [`docs/scaffold-brief.md`](docs/scaffold-brief.md) for the full project brief.

## Package structure

```
astro/        scaffold() integration, config defaults, content-schema.ts (Zod)
components/
  layout/     Header, Footer, Sidebar, KBFamilyNav
  notation/   SymbolTooltip, NotationSheet
  interactive/  ParamSlider, TransformViz, DraggableGeometry, StepThrough,
                GradientDescentPlayground, DistributionExplorer, PyodideCell, SelfCheck
  graph/      PrereqGraph — directed prerequisite DAG, global + local modes
  content/    ConceptLink, Callout, CodeCell
styles/       tokens.css, base.css, theme.ts (light/dark/system)
registry/     kbs.json — single source of truth for every KB's name/url/tagline/status
scripts/      validate-graph.ts, check-links.ts — run in each KB's CI
```

`.github/workflows/deploy-pages.yml` is the reusable deploy workflow every KB calls (see [`.github/workflows/README.md`](.github/workflows/README.md) for the ~5-line usage).

## Development

```sh
bun install
bun run typecheck
bun run lint
bun run format       # or format:check
```

Version bumps go through [changesets](.changeset/README.md) — run `bun run changeset` to describe a change before merging; publishing happens automatically on a `v*` tag push.
