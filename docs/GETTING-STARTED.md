# Getting Started with Eve Horizon

> One command to start, AI configures everything

## Quick Start (5 minutes)

### 1. Initialize Your Project

```bash
# Install the Eve CLI
npm install -g @eve-horizon/cli

# Create a new project
eve init my-project
cd my-project
```

This downloads the starter template, sets up a fresh git repo, and installs skills automatically.

### 2. Start Your AI Coding Agent

Open the project in Claude Code, Cursor, or your preferred AI coding agent:

```bash
claude  # or cursor, etc.
```

### 3. Run the Setup Skill

Ask your AI agent:

> "Run the eve-new-project-setup skill"

The AI will:
- Set up your staging profile and authentication
- Interview you about your project
- Configure the Eve manifest
- Help you set up your own Git remote

That's it! Your project is ready.

---

## What Just Happened?

The `eve init` command:
1. Downloaded the starter template from GitHub
2. Stripped template git history and created a fresh repo
3. Installed Eve skills for your AI coding agent
4. Created an initial commit

The setup skill then automated:
1. **Profile Creation**: `eve profile create staging --api-url https://api.eve-staging.incept5.dev`
2. **Authentication**: Using your SSH key (auto-discovered from GitHub if needed)
3. **Manifest Configuration**: Set project slug, name, description in `.eve/manifest.yaml`
4. **Git Remote**: Configured your own repository

## What Can Eve Horizon Do?

Eve Horizon runs AI-powered jobs for your project:

| Category | Examples |
|----------|----------|
| **CI/CD** | Automated tests, builds, deployments |
| **Code Review** | PR feedback, security scanning |
| **Documentation** | Generate docs, changelogs, READMEs |
| **Development** | Code scaffolding, refactoring, migrations |

## Starter API & Tests

The starter service exposes a small todos API:

```bash
GET    /health
GET    /todos
POST   /todos
GET    /todos/:id
PATCH  /todos/:id
DELETE /todos/:id
```

OpenAPI is available at:

```bash
GET /openapi.json
```

The React + Tailwind UI is served at:

```bash
GET /
```

Run the integration tests locally:

```bash
./scripts/integration-test.sh
```

Run the API (and UI) locally with Docker Compose:

```bash
docker compose up --build    # http://localhost:3000
```

Or run directly:

```bash
cd apps/api
npm start
```

Deploy to environments:

```bash
# Direct deployment (requires --ref with git SHA or branch)
eve env deploy test --ref main
eve env deploy staging --ref abc123

# Via pipeline (recommended for CI/CD)
eve pipeline run deploy --env staging
```

**Note**: When using `eve env deploy`, the `--ref` parameter is required and must be a valid git commit SHA or branch name.

## Deployment Patterns

### Direct Deployment

Use `eve env deploy` to deploy directly to an environment:

```bash
eve env deploy test --ref main      # Deploy test using main branch
eve env deploy staging --ref abc123  # Deploy staging using specific commit
```

The `--ref` parameter is **required** and accepts:
- Git commit SHA (e.g., `abc123`)
- Branch name (e.g., `main`, `feature-xyz`)

### Promotion Flow (test → staging)

When environments have pipelines configured (see `.eve/manifest.yaml`), use this pattern:

```bash
# 1. Build and deploy to test environment
eve env deploy test --ref abc123

# 2. Get release information after successful build
eve release resolve v1.2.3

# 3. Promote to staging with the same ref and release ID
eve env deploy staging --ref abc123 --inputs '{"release_id":"rel_xxx"}'
```

This ensures you build artifacts once in test, then promote the same artifacts to staging without rebuilding.

## Next Steps

After setup, try these:

```bash
# Sync your Claude/Codex OAuth tokens
eve auth sync

# Import secrets from a file (org/user/project scope)
cp secrets.env.example secrets.env
eve secrets import --org org_xxx --file ./secrets.env

# Create your first job
eve jobs create --prompt "Review the codebase and suggest improvements"

# Check job status
eve jobs list
```

---

## Alternative: Clone Directly

If you prefer to clone the template directly instead of using `eve init`:

```bash
git clone https://github.com/Incept5/eve-horizon-starter my-project
cd my-project

# Remove template history and start fresh
rm -rf .git
git init
git add -A
git commit -m "Initial commit"

# Install CLI and skills
npm install -g @eve-horizon/cli
eve skills install
```

Then start your AI agent and run the eve-new-project-setup skill.

---

## Manual Setup (Alternative)

If you prefer to set up manually or need to troubleshoot, follow these steps.

### Prerequisites

- **SSH key** (ed25519 or RSA) - typically at `~/.ssh/id_ed25519`
- **GitHub account** with your SSH key added (for auto-discovery)
- **Node.js 18+** installed
- **API URL** from your admin (e.g., `https://api.eve-staging.incept5.dev`)

### Install the CLI

```bash
# Using npm
npm install -g @eve-horizon/cli

# Using pnpm
pnpm add -g @eve-horizon/cli

# Verify installation
eve --help
```

If you're working from source:

```bash
cd packages/cli
pnpm install
pnpm build
pnpm link --global
```

### Create a Profile

```bash
eve profile create staging --api-url https://api.eve-staging.incept5.dev
```

### Set Default Credentials

```bash
eve profile set --default-email you@example.com --default-ssh-key ~/.ssh/id_ed25519
```

### Log In

```bash
eve auth login
```

If your SSH key isn't registered, the CLI will offer to fetch your keys from GitHub:

```
No registered SSH key found for this user.
Enter GitHub username to register keys (or press Enter to skip): your-github-username

Found 2 SSH key(s) for github.com/your-github-username
Register them? [Y/n]: y
Registered 2 SSH key(s)

Retrying login with registered keys...
Logged in
```

### Configure the Manifest

Edit `.eve/manifest.yaml` with your project details:

```yaml
schema: eve/compose/v2
project: my-project
services:
  api:
    build:
      context: apps/api
```

### Set Up Your Git Remote

```bash
git remote add origin git@github.com:YourOrg/my-project.git
git push -u origin main
```

---

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `eve profile show` | Show current profile settings |
| `eve profile set --org X --project Y` | Set default org and project |
| `eve auth login` | Authenticate with Eve |
| `eve auth status` | Check authentication status |
| `eve auth sync` | Sync local OAuth tokens to Eve |
| `eve org list` | List your organizations |
| `eve project list` | List projects in your org |
| `eve env deploy <env> --ref <sha>` | Deploy to environment (requires git ref) |
| `eve env status <env>` | Check environment status |
| `eve release resolve <version>` | Get release information |
| `eve pipeline run <name> --env <env>` | Run a pipeline |
| `eve secrets list` | List project secrets |
| `eve secrets set KEY VALUE` | Set a project secret |
| `eve secrets import --file ./secrets.env` | Import secrets from a file (use `--org`, `--user`, or `--project`) |
| `eve jobs create --prompt "..."` | Create a new job |
| `eve jobs list` | List jobs in your project |
| `eve jobs list --phase active` | List active jobs |
| `eve jobs ready` | Show schedulable jobs |
| `eve jobs show <id>` | View job details |
| `eve jobs follow <id>` | Stream job logs |
| `eve jobs wait <id>` | Wait for job completion |
| `eve jobs result <id>` | Get job results |
| `eve harness list` | List available AI harnesses |

---

## Harness Auth Quick Reference

Choose the harness you want to run and set the matching API key(s).
Recommended: store keys at **org** scope so all projects can use them.

```bash
# Batch import (edit secrets.env first)
cp secrets.env.example secrets.env
eve secrets import --org org_xxx --file ./secrets.env

# Or set individually
eve secrets set ANTHROPIC_API_KEY "..." --org org_xxx
```

| Harness | Required secret(s) |
|---------|--------------------|
| `mclaude` / `claude` | `ANTHROPIC_API_KEY` (preferred) or Claude OAuth via `eve auth sync` |
| `code` / `codex` | `OPENAI_API_KEY` (preferred) or `CODEX_AUTH_JSON_B64` |
| `zai` | `Z_AI_API_KEY` |
| `gemini` | `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) |

---

## Troubleshooting

### "eve: command not found"

Install the CLI:

```bash
npm install -g @eve-horizon/cli
```

### "No registered SSH key found"

Your SSH key isn't registered with Eve. Options:

1. **Auto-register from GitHub**: During login, enter your GitHub username when prompted
2. **Contact your admin**: Ask them to register your key using `eve admin invite`

### "Challenge expired"

SSH challenges are valid for 5 minutes. Request a new one:

```bash
eve auth login
```

### "Not authenticated"

Your token may have expired. Log in again:

```bash
eve auth logout
eve auth login
```

### Job Stuck in "ready"

The job is waiting to be scheduled. Check:

1. Is the orchestrator running? `eve system health`
2. Are there available workers? `eve system status`

### Job Failed

View the logs and diagnostics:

```bash
eve jobs logs <job-id>
eve jobs diagnose <job-id>
```

### Wrong Profile Active

Switch profiles:

```bash
eve profile use staging
```

### API Connection Refused

Verify the API URL is correct:

```bash
eve profile show
eve system health
```

---

## Getting Help

### CLI Help

```bash
# Main help
eve --help

# Command help
eve jobs --help

# Subcommand help
eve jobs create --help
```

### JSON Output

Add `--json` to any command for machine-readable output:

```bash
eve jobs list --json
eve auth status --json
```
