# registry/kbs.json

Single source of truth for every Scaffold content KB. `KBFamilyNav.astro` reads this file to render the "other Scaffold KBs" section on every KB homepage. Update once here, bump the `@daanish02/scaffold-core` version, and every KB's family nav updates on its next build.

## Shape

Array of objects:

| Field     | Type                    | Meaning                                                                                                  |
| --------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                | KB id, matches the `kb` enum in `content-schema.ts` (e.g. `"math"`)                                      |
| `url`     | `string`                | live site URL (or placeholder before the KB exists)                                                      |
| `tagline` | `string`                | the standard tagline: `Scaffold · <Subject> — interactive reference and learning material for <subject>` |
| `status`  | `"planned"` \| `"live"` | whether the site is deployed yet                                                                         |

`scaffold-core` and `scaffold-template` are not listed — they aren't browsable KB sites, so they don't belong in the family nav.
