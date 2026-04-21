import type {
  User, Task, Project, Notification, Department, TaskHistory, DashboardStats
} from '@/types'

// ── Departments ───────────────────────────────

export const mockDepartments: Department[] = [
  { id: 1, name: 'Engineering', manager_id: 2 },
  { id: 2, name: 'Design',      manager_id: 5 },
  { id: 3, name: 'Marketing',   manager_id: 6 },
]

// ── Users ─────────────────────────────────────

export const mockUsers: User[] = [
  { id: 1, email: 'admin@piote.io',    name: 'Alex Admin',     role: 'admin',    department_id: 1 },
  { id: 2, email: 'manager@piote.io',  name: 'Marie Manager',  role: 'manager',  department_id: 1 },
  { id: 3, email: 'alice@piote.io',    name: 'Alice Dupont',   role: 'employee', department_id: 1 },
  { id: 4, email: 'bob@piote.io',      name: 'Bob Martin',     role: 'employee', department_id: 1 },
  { id: 5, email: 'carlos@piote.io',   name: 'Carlos Silva',   role: 'manager',  department_id: 2 },
  { id: 6, email: 'diana@piote.io',    name: 'Diana Prince',   role: 'manager',  department_id: 3 },
  { id: 7, email: 'eve@piote.io',      name: 'Eve Laurent',    role: 'employee', department_id: 2 },
]

// ── Projects ──────────────────────────────────

export const mockProjects: Project[] = [
  {
    id: 1, name: 'PIOTE Core Platform', description: 'Main SaaS platform development',
    manager_id: 2, status: 'active',
    created_at: '2024-01-10T10:00:00Z', task_count: 12, completed_task_count: 5,
  },
  {
    id: 2, name: 'Mobile App', description: 'iOS & Android companion app',
    manager_id: 5, status: 'active',
    created_at: '2024-02-15T10:00:00Z', task_count: 8, completed_task_count: 2,
  },
  {
    id: 3, name: 'Marketing Portal', description: 'Internal marketing tools',
    manager_id: 6, status: 'on_hold',
    created_at: '2024-03-01T10:00:00Z', task_count: 5, completed_task_count: 5,
  },
  {
    id: 4, name: 'Data Analytics Dashboard', description: 'Business intelligence layer',
    manager_id: 2, status: 'active',
    created_at: '2024-03-20T10:00:00Z', task_count: 6, completed_task_count: 1,
  },
]

// ── Tasks ─────────────────────────────────────

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString()

export const mockTasks: Task[] = [
  {
    id: 1, title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployments.',
    assigned_to: 3, created_by: 2, project_id: 1,
    deadline: daysAgo(5), estimated_hours: 8, actual_hours: 10,
    status: 'in_progress', priority: 'high',
    delay_count: 1, consecutive_delays: 1, risk_score: null,
    created_at: daysAgo(20), updated_at: daysAgo(2),
  },
  {
    id: 2, title: 'Design system tokens', description: 'Create Figma design tokens and export to CSS variables.',
    assigned_to: 7, created_by: 5, project_id: 2,
    deadline: daysFromNow(3), estimated_hours: 6, actual_hours: 4,
    status: 'review', priority: 'medium',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(10), updated_at: daysAgo(1),
  },
  {
    id: 3, title: 'User authentication module', description: 'Implement JWT login, refresh tokens and role guards.',
    assigned_to: 4, created_by: 2, project_id: 1,
    deadline: daysAgo(8), estimated_hours: 12, actual_hours: 0,
    status: 'todo', priority: 'high',
    delay_count: 2, consecutive_delays: 2, risk_score: null,
    created_at: daysAgo(30), updated_at: daysAgo(8),
  },
  {
    id: 4, title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI 3.0.',
    assigned_to: 3, created_by: 1, project_id: 1,
    deadline: daysFromNow(7), estimated_hours: 5, actual_hours: 2,
    status: 'in_progress', priority: 'low',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(5), updated_at: daysAgo(1),
  },
  {
    id: 5, title: 'Analytics dashboard charts', description: 'Implement Recharts components for BI dashboard.',
    assigned_to: 4, created_by: 2, project_id: 4,
    deadline: daysFromNow(2), estimated_hours: 10, actual_hours: 7,
    status: 'in_progress', priority: 'high',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(8), updated_at: daysAgo(1),
  },
  {
    id: 6, title: 'Landing page redesign', description: 'Revamp public marketing landing page.',
    assigned_to: 7, created_by: 6, project_id: 3,
    deadline: daysAgo(3), estimated_hours: 15, actual_hours: 15,
    status: 'completed', priority: 'medium',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(25), updated_at: daysAgo(3),
  },
  {
    id: 7, title: 'Push notification service', description: 'Integrate FCM for mobile push notifications.',
    assigned_to: 4, created_by: 5, project_id: 2,
    deadline: daysFromNow(10), estimated_hours: 8, actual_hours: 0,
    status: 'todo', priority: 'medium',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(3), updated_at: daysAgo(3),
  },
  {
    id: 8, title: 'Database migration scripts', description: 'Write Alembic migrations for v2 schema.',
    assigned_to: 3, created_by: 2, project_id: 4,
    deadline: daysAgo(12), estimated_hours: 4, actual_hours: 0,
    status: 'cancelled', priority: 'low',
    delay_count: 1, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(20), updated_at: daysAgo(12),
  },
  {
    id: 9, title: 'SEO audit and fixes', description: 'Perform technical SEO audit and implement fixes.',
    assigned_to: 6, created_by: 6, project_id: 3,
    deadline: daysFromNow(14), estimated_hours: 6, actual_hours: 1,
    status: 'todo', priority: 'low',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: 10, title: 'Unit tests for core services', description: 'Achieve 80% test coverage for business logic.',
    assigned_to: 3, created_by: 2, project_id: 1,
    deadline: daysFromNow(5), estimated_hours: 12, actual_hours: 5,
    status: 'in_progress', priority: 'high',
    delay_count: 0, consecutive_delays: 0, risk_score: null,
    created_at: daysAgo(6), updated_at: daysAgo(1),
  },
]

// Attach related objects
export const mockTasksEnriched: Task[] = mockTasks.map(t => ({
  ...t,
  assigned_user: mockUsers.find(u => u.id === t.assigned_to),
  creator:       mockUsers.find(u => u.id === t.created_by),
  project:       mockProjects.find(p => p.id === t.project_id),
}))

// ── Notifications ─────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 1, user_id: 1, is_read: false,
    message: 'Task "Setup CI/CD pipeline" is now 5 days late.',
    related_task_id: 1, related_task: { id: 1, title: 'Setup CI/CD pipeline' },
    created_at: daysAgo(0),
  },
  {
    id: 2, user_id: 1, is_read: false,
    message: 'Task "User authentication module" has 2 consecutive delays.',
    related_task_id: 3, related_task: { id: 3, title: 'User authentication module' },
    created_at: daysAgo(1),
  },
  {
    id: 3, user_id: 1, is_read: true,
    message: 'Alice Dupont submitted "Write API documentation" for review.',
    related_task_id: 4, related_task: { id: 4, title: 'Write API documentation' },
    created_at: daysAgo(2),
  },
  {
    id: 4, user_id: 1, is_read: true,
    message: '"Landing page redesign" has been marked as completed.',
    related_task_id: 6, related_task: { id: 6, title: 'Landing page redesign' },
    created_at: daysAgo(3),
  },
  {
    id: 5, user_id: 1, is_read: false,
    message: 'New task assigned to you: "Unit tests for core services".',
    related_task_id: 10, related_task: { id: 10, title: 'Unit tests for core services' },
    created_at: daysAgo(0),
  },
]

// ── Task History ──────────────────────────────

export const mockTaskHistory: TaskHistory[] = [
  {
    id: 1, task_id: 1, changed_by: 2,
    field_changed: 'status', old_value: 'todo', new_value: 'in_progress',
    changed_at: daysAgo(10),
  },
  {
    id: 2, task_id: 1, changed_by: 3,
    field_changed: 'actual_hours', old_value: '0', new_value: '5',
    changed_at: daysAgo(7),
  },
  {
    id: 3, task_id: 1, changed_by: 2,
    field_changed: 'deadline', old_value: daysAgo(12), new_value: daysAgo(5),
    changed_at: daysAgo(6),
  },
  {
    id: 4, task_id: 1, changed_by: 3,
    field_changed: 'actual_hours', old_value: '5', new_value: '10',
    changed_at: daysAgo(2),
  },
]

// ── Dashboard stats ───────────────────────────

export const mockDashboardStats: DashboardStats = {
  total_tasks: 10,
  completed_tasks: 2,
  delayed_tasks: 3,
  completion_rate: 20,
  tasks_by_status: [
    { status: 'todo',        count: 3 },
    { status: 'in_progress', count: 4 },
    { status: 'review',      count: 1 },
    { status: 'completed',   count: 2 },
    { status: 'cancelled',   count: 1 },
  ],
  tasks_by_project: [
    { project: 'PIOTE Core',    count: 4, completed: 1 },
    { project: 'Mobile App',    count: 2, completed: 0 },
    { project: 'Marketing',     count: 2, completed: 1 },
    { project: 'Analytics',     count: 2, completed: 0 },
  ],
  tasks_by_employee: [
    { name: 'Alice Dupont',  total: 3, completed: 1, delayed: 1 },
    { name: 'Bob Martin',    total: 3, completed: 0, delayed: 1 },
    { name: 'Eve Laurent',   total: 2, completed: 1, delayed: 0 },
    { name: 'Diana Prince',  total: 1, completed: 0, delayed: 0 },
    { name: 'Marie Manager', total: 1, completed: 0, delayed: 0 },
  ],
}
