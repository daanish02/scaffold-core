# Authoring a concept page

Every concept page in Scaffold serves two readers at once: someone encountering the topic for the first time, and someone who already knows it and wants a precise refresher. The way we do that on one page is **layered sections** — each with its own natural length, so a beginner reads top-to-bottom while an expert can jump straight to the formal definition or the demo.

Before writing prose for a concept, ask:

> **Does an interactive or diagram explain this better than a paragraph would?**

If yes, build the demo first, and let the prose cover only what the demo can't — the *why*, edge cases, and connections to other concepts. Matrices-as-transformations, gradient descent, eigenvectors, and the CLT are all cases where the visual should lead.

## The six sections

Write concept pages in this order. Not every section needs to be long — some concepts might have a two-sentence "common pitfalls" section, and that's fine.

### 1. Intuition

2-4 sentences. Plain language, no notation. This is the answer to "what is this, and why would I care?" for someone who has never seen the topic before.

### 2. Visual / interactive

Leads the page if a demo explains the concept better than prose would. Pull from `components/interactive/` — `TransformViz`, `GradientDescentPlayground`, `DistributionExplorer`, `DraggableGeometry`, `VectorViz`, `StepThrough` — or build a concept-specific one using `ParamSlider` as the shared control primitive.

If nothing in `components/interactive/` fits — most concepts outside math/ML won't have a ready-made component (a Git commit DAG, a cache-hierarchy diagram, an options-payoff chart) — don't wait for a new core component to be built. Write the visual inline as freeform HTML/CSS/JS (a `<canvas>`, inline SVG, or plain DOM), wrapped in `Demo` for consistent chrome:

```mdx
import Demo from "@daanish02/scaffold-core/components/interactive/Demo.astro";

<Demo title="Interactive · Commit graph" hint="click a commit">
  <canvas id="commit-graph" width="600" height="300"></canvas>
  <script>
    // plain JS, reads CSS custom properties (--accent, --ink, etc.) for theming
  </script>
</Demo>
```

Use the design tokens (`var(--accent)`, `var(--ink-soft)`, etc. — see `styles/tokens.css`) so it matches the rest of the page in both light and dark mode, the same way `TransformViz` reads them via `getComputedStyle`. Promote it into a real `components/interactive/*.tsx` component in core only once a second KB needs the same shape — most one-off visuals should just stay inline.

If the concept doesn't have an obvious visual, it's fine to skip this section — don't force an interactive where a diagram or nothing serves better.

If the interactive has numeric parameters a formula depends on (e.g. a transformation matrix, a learning rate), show that formula live next to the controls, updating as the parameters change — seeing the equation track the slider is a bigger clarity win than only showing it later in "Formal definition." Skip this if the demo isn't formula-driven; not every interactive needs an equation attached.

### 3. Formal definition

Dense, precise, notation-heavy. This is the section an expert scans on a refresher. Use KaTeX for notation (wired up automatically via `scaffold()`), and wrap symbols in `SymbolTooltip` so hovering/tapping links back to the notation sheet.

### 4. Common pitfalls

Short, bulleted. Use `Callout.astro` for each pitfall — it renders as a labeled warning box, not inline prose.

### 5. Connects to

Prerequisite and related concept chips, doubling as navigation and as "here's where this matters later." Use `ConceptLink` for every reference — never a raw `<a href>` to another concept, since `ConceptLink` resolves the link via the registry and gets checked by `check-links.ts` in CI.

```mdx
<ConceptLink id="math:linear-algebra:vectors" />
```

### 6. Self-check

2-3 questions using `SelfCheck.tsx`. This is a mirror, not a test — no scoring, no separate answer key. Each answer reveals inline via "Show answer," and every answer must include a one-sentence *why*, not just the answer itself.

## Frontmatter

Every concept page's frontmatter must validate against `content-schema.ts`. At minimum:

```yaml
---
id: "math:linear-algebra:eigenvectors"
kb: "math"
title: "Eigenvectors & eigenvalues"
section: "linear-algebra"
prerequisites:
  - "math:linear-algebra:vectors"
  - "math:linear-algebra:matrices-as-transformations"
difficulty: "core"
status: "draft"
hasInteractive: true
---
```

`id` is namespaced as `kb:section:concept`, not a URL — this is what makes cross-repo links stable even if a KB restructures its folder layout. See `content-schema.ts` for the full field list, and `registry/README.md` for how `kb` values map to live KB sites.

CI runs `validate-graph.ts` (no dangling prerequisites, no cycles) and `check-links.ts` (every `ConceptLink` resolves) on every PR — fix any failures there before merging.
