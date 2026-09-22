import type { Concept } from "./content-schema.ts";

/**
 * Minimal shape of an Astro content collection entry this module needs —
 * kept generic (not importing astro:content) since that virtual module
 * only resolves inside a real Astro project, not scaffold-core itself.
 */
export interface ConceptEntry {
  slug: string;
  data: Concept;
}

export interface SidebarLink {
  href: string;
  label: string;
  current?: boolean;
}
export interface SidebarGroup {
  label: string;
  links: SidebarLink[];
}

/**
 * Builds getStaticPaths() params/props for a KB's [section]/[concept].astro
 * route from its "concepts" content collection. Splits each entry's slug
 * ("section/concept") into the two route params Astro expects.
 */
export function getConceptStaticPaths<T extends ConceptEntry>(concepts: T[]) {
  return concepts.map((entry) => {
    const [section, concept] = entry.slug.split("/");
    return { params: { section, concept }, props: { entry } };
  });
}

/**
 * Builds the single-section sidebar group for a concept page: every concept
 * in the same section as `entry`, current one marked, hrefs relative to
 * Astro's configured base path.
 */
export function buildSidebarGroups<T extends ConceptEntry>(
  entry: T,
  allConcepts: T[],
  base: string,
): SidebarGroup[] {
  const normalizedBase = base.replace(/\/?$/, "/");
  return [
    {
      label: entry.data.section,
      links: allConcepts
        .filter((c) => c.data.section === entry.data.section)
        .map((c) => ({
          href: `${normalizedBase}${c.slug}/`,
          label: c.data.title,
          current: c.slug === entry.slug,
        })),
    },
  ];
}

/** The prerequisite + related ids to render as "Prerequisites & related" chips. */
export function getConnectsToIds(entry: ConceptEntry): string[] {
  return [...entry.data.prerequisites, ...entry.data.related];
}
