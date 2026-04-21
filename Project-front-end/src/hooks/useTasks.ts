import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskFilters, TaskFormData } from '@/types'
import {
  getTasks, getTask, createTask, updateTask, deleteTask, getTaskHistory,
} from '@/services/tasks.service'

export const TASKS_KEY = 'tasks'

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => getTasks(filters),
  })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => getTask(id),
    enabled: !!id,
  })
}

export function useTaskHistory(taskId: number) {
  return useQuery({
    queryKey: ['task-history', taskId],
    queryFn: () => getTaskHistory(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskFormData) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) =>
      updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
