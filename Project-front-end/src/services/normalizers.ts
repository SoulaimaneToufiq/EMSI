import type { Project, Task, TaskFilters, User } from '@/types'

export function displayNameFromEmail(email: string): string {
  const raw = email.split('@')[0] ?? ''
  return raw
    .split(/[._-]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ') || email
}

export function normalizeUser(user: User): User {
  return {
    ...user,
    name: user.name || displayNameFromEmail(user.email),
  }
}

export function normalizeUsers(users: User[]): User[] {
  return users.map(normalizeUser)
}

export function mapTaskFilters(filters?: TaskFilters): Record<string, string | number> | undefined {
  if (!filters) return undefined
  const params: Record<string, string | number> = {}

  if (filters.status) params.task_status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.assigned_to) params.assigned_to = Number(filters.assigned_to)
  if (filters.project_id) params.project_id = Number(filters.project_id)
  return params
}

export function enrichProjects(projects: Project[], users: User[]): Project[] {
  const byId = new Map(users.map(user => [user.id, user]))
  return projects.map(project => ({
    ...project,
    manager: project.manager ?? (project.manager_id ? byId.get(project.manager_id) : undefined),
  }))
}

export function enrichTasks(tasks: Task[], users: User[], projects: Project[]): Task[] {
  const usersById = new Map(users.map(user => [user.id, user]))
  const projectsById = new Map(projects.map(project => [project.id, project]))
  return tasks.map(task => ({
    ...task,
    assigned_user: task.assigned_user ?? (task.assigned_to ? usersById.get(task.assigned_to) : undefined),
    creator: task.creator ?? (task.created_by ? usersById.get(task.created_by) : undefined),
    project: task.project ?? (task.project_id ? projectsById.get(task.project_id) : undefined),
  }))
}
