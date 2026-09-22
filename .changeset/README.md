# Changesets

Version bumps for `@daanish02/scaffold-core` are deliberate, not manual. To ship a change:

1. Run `bunx changeset` and describe the change — this writes a markdown file in this directory.
2. Commit it alongside your PR.
3. On merge, bump the version and tag `vX.Y.Z` — the tag push triggers `.github/workflows/publish.yml`, which runs `changeset publish`.

See https://github.com/changesets/changesets for the full docs.
