/**
 * TypeScript types for Eve Horizon API responses
 */

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
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

export type JobPhase =
  | 'plan'
  | 'work'
  | 'review'
  | 'done'
  | 'blocked'
  | 'cancelled';

export type JobStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type IssueType = 'bug' | 'feature' | 'chore' | 'docs' | 'test' | 'refactor';

export interface Job {
  id: number;
  project_id: number;
  parent_id?: number | null;
  description: string;
  phase: JobPhase;
  status: JobStatus;
  issue_type?: IssueType | null;
  assignee_id?: number | null;
  depth?: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
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
  project_id: number;
  parent_id?: number | null;
  description: string;
  phase?: JobPhase;
  issue_type?: IssueType;
}

export interface UpdateJobRequest {
  description?: string;
  phase?: JobPhase;
  status?: JobStatus;
  issue_type?: IssueType;
  assignee_id?: number | null;
}
