import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/dashboard.service'

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: getDashboardStats })
}
