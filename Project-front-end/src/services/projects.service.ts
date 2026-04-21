import type { Project, ProjectFormData } from '@/types'
import { api } from './api'
import { getUsers } from './users.service'
import { enrichProjects } from './normalizers'

export async function getProjects(): Promise<Project[]> {
  const [projectsResult, usersResult] = await Promise.allSettled([
    api.get<Project[]>('/projects'),
    getUsers(),
  ])

  if (projectsResult.status === 'rejected') throw projectsResult.reason
  const projects = projectsResult.value.data
  const users    = usersResult.status === 'fulfilled' ? usersResult.value : []
  return enrichProjects(projects, users)
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const payload = {
    name:        data.name,
    description: data.description || undefined,
    manager_id:  data.manager_id  || undefined,
    start_date:  data.start_date  || undefined,
    end_date:    data.end_date    || undefined,
    status:      data.status,
  }
  const { data: project } = await api.post<Project>('/projects/', payload)
  return getProject(project.id)
}

export async function getProject(id: number): Promise<Project> {
  const [{ data: project }, users] = await Promise.all([
    api.get<Project>(`/projects/${id}`),
    getUsers(),
  ])
  return enrichProjects([project], users)[0]
}
