#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import matter from "gray-matter";
import kbs from "../registry/kbs.json" with { type: "json" };
import { safeParseConcept, parseConceptId } from "../astro/content-schema.ts";

/**
 * CI check: scans a content directory for <ConceptLink id="..." /> usages
 * and validates that each id resolves — the kb exists in
 * registry/kbs.json, and (for ids whose kb matches the current KB) the
 * target concept actually exists in this content dir. Ids pointing at a
 * different KB are resolved at that KB's own build time, not here.
 *
 * Usage: bun scripts/check-links.ts <content-dir> <current-kb-name>
 */

const CONCEPT_LINK_RE = /<ConceptLink\s+id=["']([^"']+)["']/g;

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

function loadKnownIds(contentDir: string): Set<string> {
  const ids = new Set<string>();
  for (const file of findContentFiles(contentDir)) {
    const { data } = matter(readFileSync(file, "utf-8"));
    const result = safeParseConcept(data);
    if (result.success) ids.add(result.data.id);
  }
  return ids;
}

function main() {
  const contentDir = process.argv[2];
  const currentKb = process.argv[3];
  if (!contentDir || !currentKb) {
    console.error("Usage: bun scripts/check-links.ts <content-dir> <current-kb-name>");
    process.exit(1);
  }

  const knownKbs = new Set(kbs.map((k) => k.name));
  const knownIds = loadKnownIds(contentDir);
  const errors: string[] = [];

  for (const file of findContentFiles(contentDir)) {
    const content = readFileSync(file, "utf-8");
    for (const match of content.matchAll(CONCEPT_LINK_RE)) {
      const id = match[1];
      let kb: string;
      try {
        ({ kb } = parseConceptId(id));
      } catch (err) {
        errors.push(`${file}: ${(err as Error).message}`);
        continue;
      }
      if (!knownKbs.has(kb)) {
        errors.push(`${file}: ConceptLink id="${id}" references unknown kb "${kb}"`);
        continue;
      }
      if (kb === currentKb && !knownIds.has(id)) {
        errors.push(`${file}: ConceptLink id="${id}" not found in this KB's content`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(
      "Dangling ConceptLink references found:\n" + errors.map((e) => `  ${e}`).join("\n"),
    );
    process.exit(1);
  }

  console.log(`check-links: all ConceptLink references resolve (${knownIds.size} local concepts).`);
}

main();
