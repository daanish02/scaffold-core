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

That's the whole file — install, build, Pagefind index, and deploy to Pages all happen inside the reusable workflow.
