#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import matter from "gray-matter";
import { safeParseConcept, type Concept } from "../astro/content-schema.ts";

/**
 * CI check: scans a content directory for concept frontmatter (MD/MDX
 * files), validates each against the schema, and fails if any
 * prerequisite id points at a concept that doesn't exist (dangling) or if
 * the prerequisite graph contains a cycle.
 *
 * Usage: bun scripts/validate-graph.ts <content-dir>
 */

function findContentFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findContentFiles(full));
    } else if ([".md", ".mdx"].includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

function loadConcepts(contentDir: string): { concept: Concept; file: string }[] {
  const files = findContentFiles(contentDir);
  const concepts: { concept: Concept; file: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const { data } = matter(raw);
    const result = safeParseConcept(data);
    if (!result.success) {
      errors.push(`${file}: ${result.error.message}`);
      continue;
    }
    concepts.push({ concept: result.data, file });
  }

  if (errors.length > 0) {
    console.error("Schema validation failed:\n" + errors.join("\n"));
    process.exit(1);
  }

  return concepts;
}

function findDanglingPrerequisites(concepts: Concept[]): string[] {
  const ids = new Set(concepts.map((c) => c.id));
  const dangling: string[] = [];
  for (const concept of concepts) {
    for (const prereq of concept.prerequisites) {
      if (!ids.has(prereq)) {
        dangling.push(`${concept.id} -> ${prereq} (missing)`);
      }
    }
  }
  return dangling;
}

function findCycle(concepts: Concept[]): string[] | null {
  const graph = new Map(concepts.map((c) => [c.id, c.prerequisites]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  function visit(id: string): string[] | null {
    if (visited.has(id)) return null;
    if (visiting.has(id)) {
      const cycleStart = stack.indexOf(id);
      return [...stack.slice(cycleStart), id];
    }
    visiting.add(id);
    stack.push(id);
    for (const prereq of graph.get(id) ?? []) {
      const cycle = visit(prereq);
      if (cycle) return cycle;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return null;
  }

  for (const id of graph.keys()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }
  return null;
}

function main() {
  const contentDir = process.argv[2];
  if (!contentDir) {
    console.error("Usage: bun scripts/validate-graph.ts <content-dir>");
    process.exit(1);
  }

  const loaded = loadConcepts(contentDir);
  const concepts = loaded.map((l) => l.concept);

  const dangling = findDanglingPrerequisites(concepts);
  if (dangling.length > 0) {
    console.error("Dangling prerequisites found:\n" + dangling.map((d) => `  ${d}`).join("\n"));
    process.exit(1);
  }

  const cycle = findCycle(concepts);
  if (cycle) {
    console.error("Cycle detected in prerequisite graph:\n  " + cycle.join(" -> "));
    process.exit(1);
  }

  console.log(`validate-graph: ${concepts.length} concepts checked, no dangling refs, no cycles.`);
}

main();
