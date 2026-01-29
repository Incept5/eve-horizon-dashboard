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
