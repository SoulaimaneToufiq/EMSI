import type { WorkflowLog, Anomaly } from '@/types'
import { api } from './api'

export async function getWorkflowLogs(): Promise<WorkflowLog[]> {
  const { data } = await api.get<WorkflowLog[]>('/workflow-logs/')
  return data
}

export async function getAnomalies(resolved?: boolean): Promise<Anomaly[]> {
  const params: Record<string, unknown> = {}
  if (resolved !== undefined) params.resolved = resolved
  const { data } = await api.get<Anomaly[]>('/anomalies/', { params })
  return data
}

export async function resolveAnomaly(id: number): Promise<Anomaly> {
  const { data } = await api.patch<Anomaly>(`/anomalies/${id}/resolve`, {})
  return data
}
