# Reusable deploy workflow

Each KB repo calls `deploy-pages.yml` from its own `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    uses: daanish02/scaffold-core/.github/workflows/deploy-pages.yml@main
```

That's the whole file — enabling Pages (if not already configured), install, build, Pagefind index, and deploy all happen inside the reusable workflow. A brand-new repo created from `scaffold-template` doesn't inherit the source repo's Pages settings, so `deploy-pages.yml` enables it itself on first run instead of requiring a caller-side workaround.
