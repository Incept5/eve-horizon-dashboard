# Eve Horizon Dashboard - Expansion & Staging Deployment Plan

> Plan (Proposed)
> Last Updated: 2026-02-10
> Supersedes: `system-dashboard-app-plan.md` (Phase 0-9 complete, this is v2)

## Context

The dashboard was built from the v1 plan and has a working React SPA with BFF proxy, auth, project/job board, and basic admin views. However:

- **6 of 10 pages use mock data** (Jobs, Pipelines, Environments, Review, Epics, EpicDetail)
- **API client only covers 4 domains** (jobs, environments, pipelines, thin system)
- **No org/project management** (create orgs, manage members, manage secrets)
- **No builds or workflows UI** (the Eve API supports both)
- **No role-based access beyond binary `is_admin`** (no org admin, no project admin)
- **Eve CLI profile not configured** for staging deployment

The Eve CLI now exposes a much richer API surface (orgs, projects, members, secrets, builds, workflows, events, harnesses, admin) that the dashboard should surface.

### Current State

**Stack**: React 18 + Vite 5 + Tailwind 3 + TypeScript + React Query 5 + React Router 6
**Architecture**: BFF Express server serves SPA, proxies `/api/*` to Eve API
**Eve Profile**: `default` → `https://api.eh1.incept5.dev`, org `incept5`, project `Dashboard`

**Working pages** (real API): LoginPage, ProjectsPage, BoardPage
**Mock data pages**: JobsPage, PipelinesPage, EnvironmentsPage, ReviewPage, EpicsPage, EpicDetailPage
**Existing but limited**: SystemPage (3 tabs: orgs, members, events)

**Existing API modules**: `auth.ts`, `client.ts`, `jobs.ts`, `environments.ts`, `pipelines.ts`, `system.ts`, `types.ts`
**Existing hooks**: `useAuth.ts`, `useJobs.ts`, `useProjects.ts`, `useKeyboardShortcuts.ts`
**Existing UI components**: Button, Card, Badge (13 variants), Input, Select, Modal, Skeleton, EmptyState, ErrorState, CommandPalette, ProjectSwitcher, Layout, LogStream, JobDetailDrawer, CreateJobModal

### Eve REST API Surface (from CLI exploration)

| Domain | Key Endpoints | Dashboard Coverage |
|--------|--------------|-------------------|
| Orgs | CRUD + members | Partial (list only, wrong paths) |
| Projects | CRUD + members + sync | Partial (list/select only) |
| Jobs | Full lifecycle + tree + attempts + logs | Partial (CRUD exists, pages mock) |
| Environments | CRUD + deploy + services + logs | Partial (API exists, page mocks) |
| Builds | Specs + runs + logs + artifacts + cancel | **None** |
| Pipelines | List + runs + approve + cancel | Partial (API exists, page mocks) |
| Workflows | List + run + invoke | **None** |
| Secrets | CRUD + validate + import/export | **None** |
| Events | List + emit | **None** |
| Harnesses | List + details | **None** |
| System | Health + status | **None** |
| Admin | Invite users | **None** |

### Role Hierarchy

| Role | Scope | Can Do |
|------|-------|--------|
| **Platform Admin** | Global (`user.is_admin`) | All orgs, all projects, system settings, harnesses, user invite |
| **Org Admin** | Per-org (membership role) | Org members, org projects, org secrets |
| **Project Admin** | Per-project (membership role) | Project members, project secrets, builds, environments, deploys |
| **Member** | Per-project | View data, create/manage own jobs, trigger pipelines |

## Goals

- Connect all mock-data pages to the real Eve API
- Add full admin capabilities: org management, project settings, secrets, builds, workflows
- Implement role-based access (platform admin / org admin / project admin)
- Modernize navigation with section groupings
- Deploy to staging via `eve env deploy staging --ref main`

## Non-Goals (v2)

- WebSocket/SSE real-time push for all resources (polling is fine)
- GitHub/Slack integration console
- Analytics/metrics dashboards
- Playwright E2E tests (manual smoke testing)
- New npm dependencies

---

## Implementation Plan

### Phase 1: API Foundation

**Goal**: Build the complete type system, API client modules, and React Query hooks that cover every Eve REST endpoint.

#### 1A. Expand `api/types.ts`

Add ~30 new types:

```
Organization (expand with created_at, updated_at, deleted)
CreateOrgRequest, UpdateOrgRequest, AddMemberRequest
ProjectMember, CreateProjectRequest, UpdateProjectRequest
Secret, SecretScope, CreateSecretRequest, SecretValidationResult
Build (spec), BuildRun, BuildArtifact, CreateBuildRequest
Workflow, WorkflowStep, WorkflowRunResult
ProjectEvent, EmitEventRequest
Harness
SystemHealth, SystemStatus
InviteUserRequest
PaginatedResponse<T>
```

#### 1B. Create new API modules

| New File | Endpoints Covered |
|----------|-------------------|
| `api/orgs.ts` | `GET/POST /v1/orgs`, `GET/PATCH/DELETE /v1/orgs/:id`, `GET/POST/DELETE /v1/orgs/:id/members` |
| `api/projects.ts` | `GET/POST /v1/projects`, `GET/PATCH /v1/projects/:id`, `GET/POST/DELETE /v1/projects/:id/members`, `POST /v1/projects/:id/sync` |
| `api/secrets.ts` | `GET/POST/DELETE /v1/secrets`, `POST /v1/projects/:id/secrets/validate` |
| `api/builds.ts` | `GET/POST /v1/projects/:id/builds`, `GET /v1/builds/:id`, runs, logs, artifacts, cancel |
| `api/workflows.ts` | `GET /v1/projects/:id/workflows`, `GET/POST /:name/run` |
| `api/events.ts` | `GET/POST /v1/projects/:id/events` |
| `api/harnesses.ts` | `GET /v1/harnesses` |
| `api/admin.ts` | `GET /v1/system/health`, `GET /v1/system/status`, `POST /v1/admin/users/invite` |

#### 1C. Fix existing API paths

Verify whether Eve API requires `/v1/` prefix or handles bare paths. The current code uses bare paths (`/projects/...`) and BoardPage works against staging, suggesting the API may accept both. Test and correct if needed.

Refactor `api/system.ts` — its org/member calls should be replaced by the new `orgs.ts` module.

Update `api/index.ts` to export all new modules.

#### 1D. Create React Query hooks

| New File | Hooks |
|----------|-------|
| `hooks/useOrgs.ts` | `useOrgs`, `useOrg`, `useOrgMembers`, mutations for CRUD |
| `hooks/useProjectAdmin.ts` | `useProjectMembers`, `useCreateProject`, `useUpdateProject`, member mutations |
| `hooks/useSecrets.ts` | `useSecrets`, `useCreateSecret`, `useDeleteSecret`, `useValidateSecrets` |
| `hooks/useBuilds.ts` | `useBuilds`, `useBuild`, `useBuildRuns`, `useBuildLogs`, `useBuildArtifacts`, mutations |
| `hooks/useWorkflows.ts` | `useWorkflows`, `useRunWorkflow` |
| `hooks/useEvents.ts` | `useProjectEvents`, `useEmitEvent` |
| `hooks/useSystem.ts` | `useSystemHealth`, `useHarnesses`, `useInviteUser` |
| `hooks/useEnvironments.ts` | `useEnvironments`, `useDeployments`, `useDeploy` |
| `hooks/usePipelines.ts` | Wrap existing API with React Query patterns |

Follow `useJobs.ts` patterns: query keys like `['orgs']`, `['orgs', orgId, 'members']`, invalidation on mutations.

#### 1E. RBAC infrastructure

**`contexts/RoleContext.tsx`**: Computes effective permissions from `user.is_admin` + org/project membership roles.

```typescript
interface RoleContextValue {
  isPlatformAdmin: boolean;
  isOrgAdmin: (orgId: string) => boolean;
  isProjectAdmin: (projectId: string) => boolean;
  canManageOrg: (orgId: string) => boolean;     // platform admin OR org admin
  canManageProject: (projectId: string) => boolean; // platform admin OR org/project admin
  orgRole: 'admin' | 'member' | null;
  projectRole: 'admin' | 'member' | null;
}
```

**`components/RoleGate.tsx`**: Declarative role-conditional rendering component.

Wire into `main.tsx` provider tree between `AuthProvider` and `ProjectProvider`.

**Files**: ~8 new API modules, ~9 new hook files, 1 new context, 1 new component. Modify `types.ts`, `index.ts`, `system.ts`, `hooks/index.ts`, `main.tsx`.

---

### Phase 2: Connect Mock Pages to Real API

**Goal**: Replace all mock data in 6 existing pages with real API calls via Phase 1 hooks.

| Page | Change |
|------|--------|
| `JobsPage.tsx` | Remove `mockJobs` (~100 lines), use `useJobs(projectId)`, wire filters |
| `PipelinesPage.tsx` | Remove mock pipelines (~180 lines), use `usePipelines` + `usePipelineRuns` + `useRunPipeline` |
| `EnvironmentsPage.tsx` | Remove mock envs, use `useEnvironments` + `useDeploy` mutation |
| `ReviewPage.tsx` | Remove mock review jobs, use `useJobs({phase: 'review'})` + approve/reject mutations |
| `EpicsPage.tsx` | Remove mock epics, use `useJobs({issue_type: 'epic'})` |
| `EpicDetailPage.tsx` | Remove mock data, use `useJob(epicId)` + `getJobTree(epicId)` |

**Pattern**: Replace `useState(mockData)` → `useQuery` hook. Wire loading/error/empty states using existing `Skeleton`, `ErrorState`, `EmptyState` components.

**Files**: Modify 6 page files.

---

### Phase 3: New Admin Pages

#### 3A. Project Settings Page (`pages/ProjectSettingsPage.tsx`)

Tabs: **General** | **Members** | **Secrets** | **Events**

- General: Edit project name, slug, repo URL, branch. Manifest sync button.
- Members: Table with role badges, add/remove member modals.
- Secrets: Key list (values masked), create/delete, validate against manifest.
- Events: Project event log with type filtering.

Visible to all project members; edit controls gated by `canManageProject()`.

#### 3B. Org Detail Page (`pages/OrgDetailPage.tsx`)

Tabs: **Overview** | **Members** | **Projects** | **Secrets**

- Overview: Org name, slug, created date.
- Members: CRUD org members with role selection.
- Projects: Grid of org's projects with "Create Project" modal.
- Secrets: Org-scoped secrets management.

Gated by org membership or platform admin.

#### 3C. Builds Page (`pages/BuildsPage.tsx`)

- Grid of build specs for current project
- Expandable detail: runs timeline, status indicators, artifacts
- Start/cancel build actions
- Log viewer (reuse existing `LogStream` component)

#### 3D. Workflows Page (`pages/WorkflowsPage.tsx`)

- Workflow cards with name, description, steps preview
- "Run Workflow" button with JSON inputs modal (same pattern as DeployModal)
- Run history per workflow

#### 3E. Shared Components

- **`components/MembersTable.tsx`**: Reusable members CRUD table (used in Org, Project Settings, System)
- **`components/SecretsManager.tsx`**: Reusable secrets list with create/delete (used in Org, Project Settings)

**Files**: 4 new pages, 2 new shared components. Modify `App.tsx` for routes.

---

### Phase 4: Enhanced System Page & Navigation

#### 4A. System Page restructure

New tabs: **Health** | **Organizations** | **Users** | **Harnesses** | **Events**

- Health: System health dashboard with service status indicators, version, uptime.
- Organizations: Enhanced grid with CRUD + navigation to OrgDetailPage.
- Users: Invite user form (email input).
- Harnesses: Grid showing name, description, auth status, capabilities as badges.
- Events: System-level event log.

#### 4B. Layout navigation update

Group nav items into logical sections:

```
WORK:    Projects | Board | Epics | Jobs | Review
DEVOPS:  Builds | Pipelines | Workflows | Environments
ADMIN:   Settings (project admin+) | System (platform admin)
```

Sections separated by subtle dividers and labels. Items filtered by role via `RoleContext`.

#### 4C. Command Palette + Shortcuts update

- Add commands: Navigate to Builds, Workflows, Settings, Org Detail
- Add quick actions: "Deploy to Staging", "Run Pipeline", "Invite User", "Create Secret"
- Add keyboard shortcuts: `g+d` builds, `g+w` workflows, `g+s` settings

#### 4D. Route updates in `App.tsx`

Full route tree:

```
/login                    → LoginPage
/projects                 → ProjectsPage
/board                    → BoardPage
/epics                    → EpicsPage
/epics/:epicId            → EpicDetailPage
/jobs                     → JobsPage
/review                   → ReviewPage
/builds                   → BuildsPage (NEW)
/pipelines                → PipelinesPage
/workflows                → WorkflowsPage (NEW)
/environments             → EnvironmentsPage
/settings                 → ProjectSettingsPage (NEW)
/orgs/:orgId              → OrgDetailPage (NEW)
/system                   → SystemPage (admin-only)
```

**Files**: Modify SystemPage, Layout, CommandPalette, ShortcutsHelp, AdminRoute, App.tsx.

---

### Phase 5: Build, Test & Deploy to Staging

```bash
# 1. Install deps (if new ones added)
cd apps/api/client && npm install

# 2. Build the SPA
cd apps/api/client && npm run build

# 3. Test locally
cd apps/api && node index.js
# Visit http://localhost:3000 — verify pages load, API proxy works

# 4. Commit
git add . && git commit -m "feat: expand dashboard with full admin capabilities"

# 5. Push
git push origin main

# 6. Deploy to staging (uses eve profile: staging, incept5 org)
eve env deploy staging --ref main

# 7. Verify
eve env status staging
```

---

## File Inventory

### New Files (~25)

**API modules** (8):
- `api/orgs.ts`, `api/projects.ts`, `api/secrets.ts`, `api/builds.ts`
- `api/workflows.ts`, `api/events.ts`, `api/harnesses.ts`, `api/admin.ts`

**React Query hooks** (9):
- `hooks/useOrgs.ts`, `hooks/useProjectAdmin.ts`, `hooks/useSecrets.ts`
- `hooks/useBuilds.ts`, `hooks/useWorkflows.ts`, `hooks/useEvents.ts`
- `hooks/useSystem.ts`, `hooks/useEnvironments.ts`, `hooks/usePipelines.ts`

**Contexts & components** (4):
- `contexts/RoleContext.tsx`, `components/RoleGate.tsx`
- `components/MembersTable.tsx`, `components/SecretsManager.tsx`

**Pages** (4):
- `pages/ProjectSettingsPage.tsx`, `pages/OrgDetailPage.tsx`
- `pages/BuildsPage.tsx`, `pages/WorkflowsPage.tsx`

### Modified Files (~15)

- `api/types.ts` — add ~30 new types
- `api/index.ts` — export new modules
- `api/system.ts` — refactor, delegate to new modules
- `hooks/index.ts` — export new hooks
- `main.tsx` — add RoleProvider
- `App.tsx` — add new routes
- `components/Layout.tsx` — section nav + shortcuts
- `components/CommandPalette.tsx` — new commands
- `components/ShortcutsHelp.tsx` — new shortcuts
- `components/AdminRoute.tsx` — use RoleGate
- `pages/JobsPage.tsx` — remove mocks, wire API
- `pages/PipelinesPage.tsx` — remove mocks, wire API
- `pages/EnvironmentsPage.tsx` — remove mocks, wire API
- `pages/ReviewPage.tsx` — remove mocks, wire API
- `pages/EpicsPage.tsx` — remove mocks, wire API
- `pages/EpicDetailPage.tsx` — remove mocks, wire API
- `pages/SystemPage.tsx` — restructure tabs, wire hooks
- `pages/ProjectsPage.tsx` — add create project modal

---

## Verification Checklist

- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Local test: all 14 pages render without crashes
- [ ] API proxy: calls to `/api/v1/*` reach staging Eve API correctly
- [ ] Role gating: non-admin users see Work + DevOps nav only; admins see Admin section
- [ ] Mock data fully removed from all 6 pages
- [ ] New pages functional: Builds, Workflows, Settings, OrgDetail
- [ ] System page shows health, harnesses, user invite
- [ ] Staging deployment accessible at deployed URL
- [ ] `eve env status staging` shows healthy

## Open Questions

- Verify whether Eve API requires `/v1/` path prefix or accepts bare paths (current code uses bare paths and works)
- Confirm API response format for paginated endpoints (`{ data: [...], pagination: {...} }` vs custom shapes)
