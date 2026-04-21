// ─────────────────────────────────────────────
// Core domain types – mirror the SQL schema
// ─────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee'

export interface Department {
  id: number
  name: string
  manager_id: number
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  department_id: number
  department?: Department
  avatar?: string
}

// ── Tasks ─────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string
  assigned_to: number
  assigned_user?: User
  created_by: number
  creator?: User
  project_id: number
  project?: Project
  deadline: string          // ISO date string
  estimated_hours: number
  actual_hours: number
  status: TaskStatus
  priority: TaskPriority
  delay_count: number
  consecutive_delays: number
  risk_score: number | null // AI field – nullable for MVP
  created_at: string
  updated_at: string
}

export interface TaskHistory {
  id: number
  task_id: number
  changed_by: number
  changer?: User
  field_changed: string
  old_value: string
  new_value: string
  changed_at: string
}

// ── Projects ──────────────────────────────────

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled'

export interface Project {
  id: number
  name: string
  description: string
  manager_id: number
  manager?: User
  status: ProjectStatus
  created_at: string
  task_count?: number
  completed_task_count?: number
}

// ── Notifications ─────────────────────────────

export interface Notification {
  id: number
  user_id: number
  message: string
  is_read: boolean
  related_task_id: number | null
  related_task?: Pick<Task, 'id' | 'title'>
  created_at: string
}

// ── Dashboard ─────────────────────────────────

export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  delayed_tasks: number
  completion_rate: number
  tasks_by_status: { status: TaskStatus; count: number }[]
  tasks_by_project: { project: string; count: number; completed: number }[]
  tasks_by_employee: { name: string; total: number; completed: number; delayed: number }[]
}

// ── Automation ────────────────────────────────

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Anomaly {
  id: number
  task_id: number
  type: string | null
  severity: AnomalySeverity | null
  details: Record<string, unknown> | null
  detected_at: string
  resolved_at: string | null
}

export interface WorkflowLog {
  id: number
  workflow_name: string | null
  executed_at: string
  status: string | null
  tasks_processed: number | null
  errors: string | null
  duration_ms: number | null
}

// ── Auth ──────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  role: UserRole
  department_id?: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

// ── API helpers ───────────────────────────────

export interface ApiError {
  message: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

// ── Task form ─────────────────────────────────

export interface TaskFormData {
  title: string
  description: string
  assigned_to: number
  project_id: number
  deadline: string
  priority: TaskPriority
  estimated_hours: number
  status: TaskStatus
}

// ── Project form ──────────────────────────────

export interface ProjectFormData {
  name: string
  description: string
  manager_id: number | ''
  start_date: string
  end_date: string
  status: ProjectStatus
}

// ── Filters ───────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  assigned_to?: number | ''
  project_id?: number | ''
  search?: string
}
