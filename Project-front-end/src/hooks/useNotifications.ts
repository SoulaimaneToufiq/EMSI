import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications, markAsRead, markAllAsRead,
} from '@/services/notifications.service'

const KEY = 'notifications'

export function useNotifications() {
  return useQuery({ queryKey: [KEY], queryFn: getNotifications, refetchInterval: 30000 })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
