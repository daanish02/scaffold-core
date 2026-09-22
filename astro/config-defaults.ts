import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { AstroIntegration } from "astro";

/** Options a KB passes to scaffold() — site and base are Astro's own config fields. */
export interface ScaffoldOptions {
  site: string;
  base?: string;
}

/** Remark plugins every Scaffold KB needs for math notation. */
export const remarkPlugins = [remarkMath];

/** Rehype plugins every Scaffold KB needs for math notation. */
export const rehypePlugins = [rehypeKatex];

/** Integrations every Scaffold KB needs: MDX content, Pagefind search. */
export function scaffoldIntegrations(): AstroIntegration[] {
  return [mdx(), pagefind()];
}
