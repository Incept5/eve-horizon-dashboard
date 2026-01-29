# Eve Horizon Starter - Agent Instructions

This is an Eve-compatible starter project. Agents working in this repo should follow these guidelines.

## Project Overview

- **Purpose**: Minimal starter template for Eve-compatible projects
- **Stack**: Staging-first Eve Horizon with Docker Compose for local dev
- **Skills**: eve-se skillpack installed via `eve init` or `eve skills install`

Local dev runs via Docker Compose and is then translated into `.eve/manifest.yaml` for deployment to the remote staging cluster.

## Key Files

| File | Purpose |
|------|---------|
| `.eve/manifest.yaml` | Deployment configuration (services, envs) |
| `skills.txt` | Skill sources for agents |
| `.eve/hooks/on-clone.sh` | Auto-installs skills when Eve workers clone |
| `apps/api/` | Example API service |
| `scripts/` | Helper scripts for setup and deploy |

## Common Tasks

### Local dev (Docker Compose)
```bash
docker compose up --build   # http://localhost:3000
```

### Deploy to environments

**Via pipeline** (recommended for CI/CD):
```bash
eve pipeline run deploy --env staging
```

**Direct deployment** (requires explicit git ref):
```bash
# Deploy to test environment with git SHA or branch
eve env deploy test --ref abc123
eve env deploy test --ref main

# Deploy to staging with git SHA or branch
eve env deploy staging --ref abc123
eve env deploy staging --ref main
```

**Note**: The `--ref` parameter is required and must be a valid git SHA or branch name.

### Promotion flow (test → staging)
```bash
# 1. Build and deploy to test
eve env deploy test --ref abc123

# 2. Get release information
eve release resolve v1.2.3

# 3. Promote to staging with release reference
eve env deploy staging --ref abc123 --inputs '{"release_id":"rel_xxx"}'
```

### Check deployment
```bash
eve env status staging
```

### Add a new service
1. Add Dockerfile in `apps/<name>/`
2. Add service to `.eve/manifest.yaml`
3. Deploy: `eve env deploy staging --ref main` or `eve pipeline run deploy --env staging`

## Skills Available

Skills are installed automatically by `eve init`. Key skills:
- **eve-new-project-setup** - Initial profile/auth/manifest configuration
- **eve-manifest-authoring** - Manifest editing guidance
- **eve-deploy-debugging** - Troubleshoot deployments
- **eve-pipelines-workflows** - CI/CD configuration
- **eve-job-lifecycle** - Create and manage Eve jobs

Run `openskills list` to see all installed skills.

## Development Workflow

1. Make changes to code
2. Test locally: `docker compose up --build`
3. Deploy: `eve env deploy staging --ref main` (or use `eve pipeline run deploy --env staging`)
4. Verify: `eve env status staging`

## Keep AGENTS.md Current (Critical)

This file must be rewritten to match the actual product domain and tech stack once the user decides what they are building. The starter API/UI is disposable: expect to replace or remove it entirely. When the real project direction is chosen, document:

- The domain and core product goals.
- The chosen stack and architecture.
- What starter code was removed or replaced, and what (if anything) was kept.
- The new local dev and deploy workflow.
