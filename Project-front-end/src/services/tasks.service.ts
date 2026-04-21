import type { Task, TaskFormData, TaskFilters, TaskHistory } from '@/types'
import { api } from './api'
import { getProjects } from './projects.service'
import { getUsers } from './users.service'
import { enrichTasks, mapTaskFilters } from './normalizers'

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = mapTaskFilters(filters)
  const [tasksResult, usersResult, projectsResult] = await Promise.allSettled([
    api.get<Task[]>('/tasks', { params }),
    getUsers(),
    getProjects(),
  ])

  if (tasksResult.status === 'rejected') throw tasksResult.reason
  const tasks    = tasksResult.value.data
  const users    = usersResult.status    === 'fulfilled' ? usersResult.value    : []
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : []

  let result = enrichTasks(tasks, users, projects)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }
  return result
}

export async function getTask(id: number): Promise<Task> {
  const [{ data: task }, users, projects] = await Promise.all([
    api.get<Task>(`/tasks/${id}`),
    getUsers(),
    getProjects(),
  ])
  return enrichTasks([task], users, projects)[0]
}

export async function createTask(payload: TaskFormData): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', payload)
  return getTask(data.id)
}

export async function updateTask(id: number, payload: Partial<TaskFormData>): Promise<Task> {
  await api.patch<Task>(`/tasks/${id}`, payload)
  return getTask(id)
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`)
}

export async function getTaskHistory(taskId: number): Promise<TaskHistory[]> {
  const { data } = await api.get<TaskHistory[]>(`/tasks/${taskId}/history`)
  return data
}
