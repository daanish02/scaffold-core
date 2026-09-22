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

Leads the page if a demo explains the concept better than prose would. Pull from `components/interactive/` — `TransformViz`, `GradientDescentPlayground`, `DistributionExplorer`, `DraggableGeometry`, `StepThrough` — or build a concept-specific one using `ParamSlider` as the shared control primitive.

If the concept doesn't have an obvious visual, it's fine to skip this section — don't force an interactive where a diagram or nothing serves better.

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
