import { z } from "astro/zod";

export const conceptSchema = z.object({
  // Identity
  id: z.string(), // "kb:section:concept" — e.g. "math:linear-algebra:eigenvectors"
  kb: z.enum(["math", "cs", "infrastructure", "ml", "dl", "applied-dl", "econ-finance"]),
  title: z.string(),
  section: z.string(), // level 1 — e.g. "linear-algebra"

  // Relationships — drive the prereq graph, sidebar, and ConceptLink resolver
  prerequisites: z.array(z.string()).default([]), // ids, can cross KBs
  related: z.array(z.string()).default([]), // "see also," no ordering implication
  unlocks: z.array(z.string()).optional(), // rarely needed; usually inferred by scanning others' prerequisites

  // Pedagogy metadata — used for real filtering (e.g. a "core path only" mode), not inert
  difficulty: z.enum(["intro", "core", "advanced"]).default("core"),
  status: z.enum(["stub", "draft", "published"]).default("draft"),
  estimatedMinutes: z.number().optional(),

  // Content flags
  hasInteractive: z.boolean().default(false),
  tags: z.array(z.string()).default([]), // carries [opt]/[later] markers from topic lists

  description: z.string().optional(),
});

export type Concept = z.infer<typeof conceptSchema>;

/**
 * Parses and validates raw concept frontmatter, throwing a ZodError with
 * field-level detail if it doesn't conform to the schema.
 */
export function parseConcept(data: unknown): Concept {
  return conceptSchema.parse(data);
}

/**
 * Safe variant of parseConcept — returns a Zod SafeParseReturnType instead
 * of throwing, for call sites (e.g. CI validation scripts) that want to
 * collect errors across many files rather than fail on the first one.
 */
export function safeParseConcept(data: unknown): z.SafeParseReturnType<unknown, Concept> {
  return conceptSchema.safeParse(data);
}

/** Parses an id of the form "kb:section:concept" into its parts. */
export function parseConceptId(id: string): { kb: string; section: string; concept: string } {
  const parts = id.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid concept id "${id}" — expected format "kb:section:concept"`);
  }
  const [kb, section, concept] = parts;
  return { kb, section, concept };
}

const KB_DISPLAY_NAMES: Record<string, string> = {
  math: "Math",
  cs: "CS",
  infrastructure: "Infrastructure",
  ml: "ML",
  dl: "DL",
  "applied-dl": "Applied DL",
  "econ-finance": "Econ & Finance",
};

/** Maps a kb enum value (e.g. "applied-dl") to its display name (e.g. "Applied DL"). */
export function kbDisplayName(kb: string): string {
  return KB_DISPLAY_NAMES[kb] ?? kb;
}
