import type { DashboardStats } from '@/types'
import { api } from './api'
import { getProjects } from './projects.service'
import { getTasks } from './tasks.service'
import { getUsers } from './users.service'

export async function getDashboardStats(): Promise<DashboardStats> {
  const [dashboardResult, tasksResult, projectsResult, usersResult] = await Promise.allSettled([
    api.get<{
      total: number
      completed: number
      delayed: number
      completion_rate: number
      todo: number
      in_progress: number
      review: number
      cancelled: number
    }>('/tasks/dashboard'),
    getTasks(),
    getProjects(),
    getUsers(),
  ])

  const raw = dashboardResult.status === 'fulfilled' ? dashboardResult.value.data : null
  const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : []
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : []
  const users = usersResult.status === 'fulfilled' ? usersResult.value : []

  const projectAgg = projects.map(project => {
    const subset = tasks.filter(task => task.project_id === project.id)
    return {
      project: project.name,
      count: subset.length,
      completed: subset.filter(task => task.status === 'completed').length,
    }
  })

  const employeeAgg = users.map(user => {
    const subset = tasks.filter(task => task.assigned_to === user.id)
    return {
      name: user.name,
      total: subset.length,
      completed: subset.filter(task => task.status === 'completed').length,
      delayed: subset.filter(task => task.status !== 'completed' && new Date(task.deadline) < new Date()).length,
    }
  })

  return {
    total_tasks: raw?.total ?? 0,
    completed_tasks: raw?.completed ?? 0,
    delayed_tasks: raw?.delayed ?? 0,
    completion_rate: raw?.completion_rate ?? 0,
    tasks_by_status: [
      { status: 'todo',        count: raw?.todo ?? 0 },
      { status: 'in_progress', count: raw?.in_progress ?? 0 },
      { status: 'review',      count: raw?.review ?? 0 },
      { status: 'completed',   count: raw?.completed ?? 0 },
      { status: 'cancelled',   count: raw?.cancelled ?? 0 },
    ],
    tasks_by_project: projectAgg,
    tasks_by_employee: employeeAgg,
  }
}
