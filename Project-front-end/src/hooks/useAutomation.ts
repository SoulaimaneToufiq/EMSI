import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkflowLogs, getAnomalies, resolveAnomaly } from '@/services/automation.service'

export function useWorkflowLogs() {
  return useQuery({ queryKey: ['workflow-logs'], queryFn: getWorkflowLogs })
}

export function useAnomalies(resolved?: boolean) {
  return useQuery({
    queryKey: ['anomalies', resolved],
    queryFn: () => getAnomalies(resolved),
  })
}

export function useResolveAnomaly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resolveAnomaly(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anomalies'] }),
  })
}
