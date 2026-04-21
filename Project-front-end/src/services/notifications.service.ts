import type { Notification } from '@/types'
import { api } from './api'

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Array<Notification & { task_id?: number | null }>>('/notifications')
  return data.map(item => ({
    ...item,
    related_task_id: item.related_task_id ?? item.task_id ?? null,
  }))
}

export async function markAsRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await api.patch('/notifications/read-all')
}
