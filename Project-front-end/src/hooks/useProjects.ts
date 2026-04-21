import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, getProject, createProject } from '@/services/projects.service'
import type { ProjectFormData } from '@/types'

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectFormData) => createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  })
}
