/**
 * TypeScript types for Eve Horizon API responses
 */

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  name?: string;
  role?: 'admin' | 'member';
  org_id?: number;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
}

export interface Project {
  id: number;
  org_id: number;
  name: string;
  slug: string;
  repo_url: string;
  branch: string;
  created_at?: string;
  updated_at?: string;
}

export type JobPhase = 'idea' | 'backlog' | 'ready' | 'active' | 'review' | 'done' | 'cancelled';

export type JobStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type IssueType = 'epic' | 'story' | 'task';

export interface Job {
  id: string;
  project_id: string;
  subject: string;
  description?: string;
  phase: JobPhase;
  status: string;
  issue_type: IssueType;
  parent_id?: string;
  harness?: string;
  review?: string;
  created_at: string;
  updated_at: string;
  git?: {
    ref?: string;
    branch?: string;
    resolved_branch?: string;
  };
}

export interface JobDetail extends Job {
  children?: Job[];
  parent?: Job | null;
  assignee?: User | null;
  project?: Project;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ProjectListResponse {
  projects: Project[];
}

export interface JobListResponse {
  jobs: Job[];
}

export interface CreateJobRequest {
  subject: string;
  description?: string;
  issue_type: IssueType;
  phase?: JobPhase;
  parent_id?: string;
  harness?: string;
}

export interface UpdateJobRequest {
  subject?: string;
  description?: string;
  phase?: JobPhase;
  status?: JobStatus;
  issue_type?: IssueType;
  parent_id?: string;
  harness?: string;
  review?: string;
}

export interface Member {
  id: number;
  email: string;
  role: 'admin' | 'member';
  org_id: number;
  created_at?: string;
}

export interface SystemEvent {
  id: number;
  type: string;
  message: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface JobAttempt {
  id: string;
  job_id: string;
  attempt_number: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface JobTreeNode {
  job: Job;
  children: JobTreeNode[];
}

export interface JobResult {
  job_id: string;
  status: string;
  output?: unknown;
  error?: string;
}

export interface Environment {
  name: string;
  status: 'healthy' | 'deploying' | 'failed' | 'unknown';
  current_ref?: string;
  current_version?: string;
  last_deployed_at?: string;
  url?: string;
}

export interface Deployment {
  id: string;
  environment: string;
  ref: string;
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  deployed_by?: string;
  error?: string;
}

export interface Pipeline {
  name: string;
  description?: string;
  triggers?: string[];
  steps: PipelineStep[];
}

export interface PipelineStep {
  name: string;
  action: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

export interface PipelineRun {
  id: string;
  pipeline_name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  steps: PipelineRunStep[];
  result_json?: unknown;
}

export interface PipelineRunStep {
  name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  output_json?: unknown;
  error?: string;
}

// --- Organization request/response types ---

export interface CreateOrgRequest {
  name: string;
  slug?: string;
}

export interface UpdateOrgRequest {
  name?: string;
}

export interface OrgMember {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  created_at?: string;
}

export interface AddOrgMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

// --- Project request/response types ---

export interface CreateProjectRequest {
  name: string;
  slug: string;
  repo_url: string;
  branch?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  repo_url?: string;
  branch?: string;
}

export interface ProjectMember {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  created_at?: string;
}

export interface AddProjectMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

// --- Secrets ---

export type SecretScope = 'system' | 'org' | 'user' | 'project';

export interface Secret {
  id: string;
  scope_type: SecretScope;
  scope_id: string;
  key: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSecretRequest {
  key: string;
  value: string;
  type?: string;
}

export interface SecretValidationResult {
  valid: boolean;
  missing: string[];
  present: string[];
}

// --- Builds ---

export interface Build {
  id: string;
  project_id: string;
  ref: string;
  manifest_hash?: string;
  services?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BuildRun {
  id: string;
  build_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface BuildArtifact {
  id: string;
  build_id: string;
  service: string;
  image: string;
  digest?: string;
  created_at?: string;
}

// --- Workflows ---

export interface Workflow {
  name: string;
  description?: string;
  triggers?: string[];
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  action: string;
  inputs?: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  workflow_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  result?: unknown;
}

// --- Events ---

export interface ProjectEvent {
  id: string;
  project_id: string;
  type: string;
  source?: string;
  status?: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

export interface EmitEventRequest {
  type: string;
  source?: string;
  payload?: Record<string, unknown>;
}

// --- Harnesses ---

export interface Harness {
  name: string;
  aliases?: string[];
  variants?: string[];
  auth_status?: string;
  description?: string;
  capabilities?: string[];
}

// --- System ---

export interface SystemHealth {
  status: string;
  database?: string;
  details?: Record<string, unknown>;
}

export interface InviteUserRequest {
  email: string;
  github_username?: string;
  org_id?: string;
}

// --- Paginated response wrapper ---

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}
