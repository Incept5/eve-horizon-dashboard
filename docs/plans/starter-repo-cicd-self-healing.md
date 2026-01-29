# Starter Repo CI/CD + Self-Healing Changes Plan

> Status: Draft
> Last Updated: 2026-01-27
> Owner: Starter Repo
> Purpose: Update `eve-horizon-starter` so it supports CI/CD pipelines, remediation workflows, and a minimal notes/todos API with OpenAPI + integration tests.

## Scope

- Replace legacy manifest with v2 `services` + environments.
- Implement a small REST API (notes/todos) with in-memory storage.
- Serve OpenAPI at `/openapi.json` and register via `api_spec`.
- Add integration tests and a script to run them.
- Add CI/CD pipeline definitions in manifest (triggered by Eve events).

## Non-Goals

- Database-backed persistence (in-memory only).
- GitHub Actions workflows (Eve pipelines are the primary mechanism).
- Production-hardening or performance tuning.

## Requirements

1) Notes/todos API endpoints (create/list/update/delete).
2) OpenAPI JSON served at `/openapi.json`.
3) Manifest `api_spec` uses `spec_url: /openapi.json`.
4) Integration tests exercise the API.
5) `ci-cd-main` pipeline runs integration tests and deploys staging.
6) Manifest declares required secrets; `eve project sync --validate-secrets` can check them with remediation guidance.

## Implementation Plan

### Phase 1 — API + OpenAPI

- Replace `apps/api/index.js` with a small REST API.
- Use a minimal framework (Express or Fastify) or plain Node HTTP with routing.
- In-memory store (Map/array) for notes/todos.
- Expose:
  - `GET /health`
  - `GET /todos`
  - `POST /todos`
  - `GET /todos/:id`
  - `PATCH /todos/:id`
  - `DELETE /todos/:id`
- Generate or embed OpenAPI JSON and serve at `/openapi.json`.

### Phase 2 — Integration Tests

- Add `apps/api/test/integration.test.js` using Node’s built-in test runner.
- Start the server in test setup on a random port.
- Exercise full CRUD flow.
- Add `scripts/integration-test.sh` to run tests.

### Phase 3 — Manifest v2 + Pipelines

- Update `.eve/manifest.yaml` to v2 format:
  - `services.api` with `build.context: apps/api`.
  - `x-eve.api_spec` pointing to `/openapi.json`.
  - `environments.test` and `environments.staging`.
  - `pipelines.ci-cd-main` with integration test + deploy steps.
- Add `x-eve.requires.secrets` (e.g., `GITHUB_TOKEN`) for create‑PR and repo access needs.

### Phase 4 — Docs + Scripts

- Update `README.md` with pipeline/testing instructions.
- Update `docs/GETTING-STARTED.md` to reflect the new API and tests.
- Ensure `scripts/deploy.sh` (if kept) uses `eve pipeline run`.

## Acceptance Criteria

- `curl /todos` returns a valid JSON list.
- `GET /openapi.json` returns the spec and `api_spec` registers.
- `scripts/integration-test.sh` passes locally.
- Manifest sync succeeds and `ci-cd-main` pipeline can be invoked via CLI.
- `eve project sync --validate-secrets` reports missing secrets with remediation hints.

## Open Questions

- Choose Express vs Fastify vs plain Node (default: plain Node for minimal deps).
- Should we include a basic seed dataset for local demo?
