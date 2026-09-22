import type { AstroIntegration } from "astro";
import {
  scaffoldIntegrations,
  remarkPlugins,
  rehypePlugins,
  type ScaffoldOptions,
} from "./config-defaults.js";

/**
 * The Scaffold Astro integration. Wires up MDX, KaTeX (via remark-math /
 * rehype-katex in the MDX pipeline), and Pagefind search, and sets the
 * site/base path for the KB.
 *
 * Usage in a KB's astro.config.ts:
 *
 *   import { defineConfig } from "astro";
 *   import { scaffold } from "@daanish02/scaffold-core/astro/integration";
 *
 *   export default defineConfig({
 *     integrations: [scaffold({ site: "https://example.github.io", base: "/scaffold-math" })],
 *   });
 */
export function scaffold(options: ScaffoldOptions): AstroIntegration {
  const { site, base } = options;

  return {
    name: "scaffold-core",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          site,
          base,
          integrations: scaffoldIntegrations(),
          markdown: {
            remarkPlugins,
            rehypePlugins,
          },
        });
      },
    },
  };
}
