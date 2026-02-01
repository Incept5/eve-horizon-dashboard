# Eve Horizon Dashboard - Agent Instructions

This is the Eve Horizon Dashboard, a web UI for managing Eve Horizon projects, jobs, pipelines, and deployments. Agents working in this repo should follow these guidelines.

## Project Overview

- **Purpose**: Web UI for Eve Horizon - manage projects, jobs, pipelines, deployments, and system operations
- **Stack**: React 18 + Vite 5 + Tailwind 3 + TypeScript + React Query 5 + React Router 6
- **Architecture**: BFF (Backend for Frontend) pattern - Express server serves SPA and proxies `/api/*` to Eve API
- **Skills**: eve-se skillpack installed via `eve init` or `eve skills install`

The dashboard provides a comprehensive interface for Eve Horizon operations:
- Projects: Browse and manage Eve projects
- Jobs: Monitor job execution and status
- Pipelines: View and trigger pipelines
- Environments: Manage deployments across environments
- Board: Visual workflow management
- Epics: Track large initiatives
- Review: Code review queue
- System: System-level administration

## Key Files

| File | Purpose |
|------|---------|
| `apps/api/client/` | React SPA source code |
| `apps/api/client/src/components/` | UI components (Layout, ui primitives) |
| `apps/api/client/src/components/ui/` | Reusable UI primitives (Button, Card, Badge, etc.) |
| `apps/api/client/src/pages/` | Route pages (Projects, Jobs, Pipelines, Environments, Board, Epics, Review, System) |
| `apps/api/client/src/api/` | API client and TypeScript types |
| `apps/api/client/src/hooks/` | React Query hooks for data fetching |
| `apps/api/index.js` | Express server (BFF) - serves SPA and proxies API calls |
| `apps/api/Dockerfile` | Multi-stage Docker build (client build + server runtime) |
| `.eve/manifest.yaml` | Eve deployment configuration (services, envs) |
| `skills.txt` | Skill sources for agents |
| `.eve/hooks/on-clone.sh` | Auto-installs skills when Eve workers clone |

## Common Tasks

### Local dev (React SPA only)
```bash
cd apps/api/client
npm run dev          # http://localhost:5173 (Vite dev server)
```

### Build the SPA
```bash
cd apps/api/client
npm run build        # Output to apps/api/client/dist/
```

### Run the Express server (serves built SPA + API proxy)
```bash
cd apps/api
node index.js        # http://localhost:3000
```

### Local dev (Full stack via Docker Compose)
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

## Skills Available

Skills are installed automatically by `eve init`. Key skills:
- **eve-new-project-setup** - Initial profile/auth/manifest configuration
- **eve-manifest-authoring** - Manifest editing guidance
- **eve-deploy-debugging** - Troubleshoot deployments
- **eve-pipelines-workflows** - CI/CD configuration
- **eve-job-lifecycle** - Create and manage Eve jobs

Run `openskills list` to see all installed skills.

## Development Workflow

### For UI Development
1. Make changes to React components in `apps/api/client/src/`
2. Test locally: `cd apps/api/client && npm run dev` (hot reload)
3. Build: `cd apps/api/client && npm run build`
4. Test production build: `cd apps/api && node index.js`
5. Deploy: `eve env deploy staging --ref main` (or use `eve pipeline run deploy --env staging`)
6. Verify: `eve env status staging`

### For API/BFF Changes
1. Make changes to `apps/api/index.js`
2. Test locally: `docker compose up --build`
3. Deploy: `eve env deploy staging --ref main` (or use `eve pipeline run deploy --env staging`)
4. Verify: `eve env status staging`

## Architecture Notes

### BFF Pattern
The Express server (`apps/api/index.js`) implements the Backend for Frontend pattern:
- Serves the built React SPA from `apps/api/client/dist/`
- Proxies `/api/*` requests to the Eve API backend
- Handles authentication, session management, and request transformation
- Provides a single deployment unit for the entire dashboard

### Multi-stage Docker Build
The `apps/api/Dockerfile` uses multi-stage builds:
1. **Stage 1**: Build React SPA with Node + Vite
2. **Stage 2**: Runtime image with Node + Express + built SPA

### React Query + API Layer
- API client in `apps/api/client/src/api/` defines TypeScript types and API functions
- React Query hooks in `apps/api/client/src/hooks/` manage server state, caching, and refetching
- Components consume hooks for declarative data fetching with loading/error states

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>eve-auth-and-secrets</name>
<description>Authenticate with Eve and manage project secrets for deployments and workflows.</description>
<location>project</location>
</skill>

<skill>
<name>eve-cli-primitives</name>
<description>Core Eve CLI primitives and capabilities for app developers. Use as the quick reference for commands and flows.</description>
<location>project</location>
</skill>

<skill>
<name>eve-deploy-debugging</name>
<description>Deploy and debug Eve-compatible apps via the CLI, with a focus on staging environments.</description>
<location>project</location>
</skill>

<skill>
<name>eve-job-debugging</name>
<description>Monitor and debug Eve jobs with CLI follow, logs, wait, and diagnose commands. Use when work is stuck, failing, or you need fast status.</description>
<location>project</location>
</skill>

<skill>
<name>eve-job-lifecycle</name>
<description>Create, manage, and review Eve jobs, phases, and dependencies. Use when running knowledge work in Eve or structuring job hierarchies.</description>
<location>project</location>
</skill>

<skill>
<name>eve-local-dev-loop</name>
<description>Local Docker Compose development loop for Eve-compatible apps, with handoff to staging deploys.</description>
<location>project</location>
</skill>

<skill>
<name>eve-manifest-authoring</name>
<description>Author and maintain Eve manifest files (.eve/manifest.yaml) for services, environments, pipelines, workflows, and secret interpolation. Use when changing deployment shape or runtime configuration in an Eve-compatible repo.</description>
<location>project</location>
</skill>

<skill>
<name>eve-new-project-setup</name>
<description>Configure a new Eve Horizon project after running eve init (profile, auth, manifest, and repo linkage).</description>
<location>project</location>
</skill>

<skill>
<name>eve-orchestration</name>
<description>Orchestrate jobs via depth propagation, parallel decomposition, relations, and control signals</description>
<location>project</location>
</skill>

<skill>
<name>eve-pipelines-workflows</name>
<description>Define and run Eve pipelines and workflows via manifest and CLI. Use when wiring build, release, deploy flows or invoking workflow jobs.</description>
<location>project</location>
</skill>

<skill>
<name>eve-plan-implementation</name>
<description>Execute software engineering plan documents using Eve jobs, dependencies, and review gating.</description>
<location>project</location>
</skill>

<skill>
<name>eve-project-bootstrap</name>
<description>Bootstrap an Eve-compatible project with org/project setup, profile defaults, repo linkage, and first deploy.</description>
<location>project</location>
</skill>

<skill>
<name>eve-read-eve-docs</name>
<description>Load first. Index of distilled Eve Horizon system docs for CLI usage, manifests, pipelines, jobs, secrets, and debugging.</description>
<location>project</location>
</skill>

<skill>
<name>eve-repo-upkeep</name>
<description>Keep Eve-compatible repos aligned with platform best practices and current manifest conventions.</description>
<location>project</location>
</skill>

<skill>
<name>eve-se-index</name>
<description>Load this first. Routes to the right Eve SE skill for developing, deploying, and debugging Eve-compatible apps.</description>
<location>project</location>
</skill>

<skill>
<name>eve-skill-distillation</name>
<description>Distill repeated work into Eve skillpacks by creating or updating skills with concise instructions and references. Use when a workflow repeats or knowledge should be shared across agents.</description>
<location>project</location>
</skill>

<skill>
<name>eve-troubleshooting</name>
<description>Troubleshoot common Eve deploy and job failures using CLI-first diagnostics.</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
