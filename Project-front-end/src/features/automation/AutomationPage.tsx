import { useState } from 'react'
import { useWorkflowLogs, useAnomalies, useResolveAnomaly } from '@/hooks/useAutomation'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import type { AnomalySeverity } from '@/types'
import s from './AutomationPage.module.css'

type Tab = 'logs' | 'anomalies'

const SEVERITY_COLOR: Record<AnomalySeverity, string> = {
  low:      '#16a34a',
  medium:   '#d97706',
  high:     '#dc2626',
  critical: '#7c3aed',
}

const STATUS_COLOR: Record<string, string> = {
  success: '#16a34a',
  error:   '#dc2626',
  partial: '#d97706',
  running: '#2563eb',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AutomationPage() {
  const [tab, setTab] = useState<Tab>('logs')
  const [showResolved, setShowResolved] = useState(false)

  const { data: logs = [],      isLoading: logsLoading }      = useWorkflowLogs()
  const { data: anomalies = [], isLoading: anomaliesLoading }  = useAnomalies(showResolved ? undefined : false)
  const resolve = useResolveAnomaly()

  const isLoading = tab === 'logs' ? logsLoading : anomaliesLoading

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.headingTitle}>Automation</div>
          <div className={s.headingSub}>n8n workflow logs and anomaly detection</div>
        </div>
        <div className={s.webhookInfo}>
          <span className={s.webhookLabel}>Webhook secret:</span>
          <code className={s.webhookCode}>piote-n8n-secret</code>
        </div>
      </div>

      <div className={s.endpointGrid}>
        {[
          { label: 'Daily Delay Alerts',   schedule: 'Every day at 18:00',       endpoint: 'GET /webhooks/delayed-tasks',  icon: <Clock size={14} /> },
          { label: 'Weekly KPI Report',    schedule: 'Every Monday at 08:00',     endpoint: 'GET /webhooks/kpi-report',     icon: <Activity size={14} /> },
          { label: 'Monthly Report',       schedule: 'Every 1st at 08:00',        endpoint: 'GET /webhooks/kpi-report',     icon: <Activity size={14} /> },
          { label: 'Time Anomaly Detect',  schedule: 'On task update (webhook)',   endpoint: 'POST /webhooks/anomaly',       icon: <AlertTriangle size={14} /> },
          { label: 'Notify Delay Alert',   schedule: 'After email send',          endpoint: 'POST /webhooks/notify-delays', icon: <Zap size={14} /> },
          { label: 'Workflow Logger',      schedule: 'End of each workflow',      endpoint: 'POST /webhooks/log',           icon: <CheckCircle size={14} /> },
        ].map(e => (
          <div key={e.endpoint} className={s.endpointCard}>
            <div className={s.endpointIcon}>{e.icon}</div>
            <div className={s.endpointLabel}>{e.label}</div>
            <div className={s.endpointSchedule}>{e.schedule}</div>
            <code className={s.endpointCode}>{e.endpoint}</code>
          </div>
        ))}
      </div>

      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'logs' ? s.activeTab : ''}`} onClick={() => setTab('logs')}>
          Workflow Logs <span className={s.tabCount}>{logs.length}</span>
        </button>
        <button className={`${s.tab} ${tab === 'anomalies' ? s.activeTab : ''}`} onClick={() => setTab('anomalies')}>
          Anomalies <span className={s.tabCount}>{anomalies.length}</span>
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <>
          {tab === 'logs' && (
            logs.length === 0 ? (
              <div className={s.empty}>No workflow executions recorded yet.</div>
            ) : (
              <div className={s.table}>
                <div className={`${s.tableRow} ${s.tableHead}`}>
                  <span>Workflow</span>
                  <span>Status</span>
                  <span>Tasks</span>
                  <span>Duration</span>
                  <span>Executed at</span>
                  <span>Errors</span>
                </div>
                {logs.map(log => (
                  <div key={log.id} className={s.tableRow}>
                    <span className={s.wfName}>{log.workflow_name ?? '—'}</span>
                    <span>
                      <span
                        className={s.statusBadge}
                        style={{ background: `${STATUS_COLOR[log.status ?? ''] ?? '#94a3b8'}22`, color: STATUS_COLOR[log.status ?? ''] ?? '#94a3b8' }}
                      >
                        {log.status ?? '—'}
                      </span>
                    </span>
                    <span>{log.tasks_processed ?? '—'}</span>
                    <span>{log.duration_ms != null ? `${log.duration_ms} ms` : '—'}</span>
                    <span className={s.dateCell}>{fmt(log.executed_at)}</span>
                    <span className={s.errCell}>{log.errors ?? '—'}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'anomalies' && (
            <>
              <div className={s.anomalyToolbar}>
                <label className={s.checkLabel}>
                  <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
                  Show resolved
                </label>
              </div>
              {anomalies.length === 0 ? (
                <div className={s.empty}>No anomalies detected yet.</div>
              ) : (
                <div className={s.anomalyList}>
                  {anomalies.map(a => {
                    const isResolved = !!a.resolved_at
                    const details = a.details as { actual_hours?: number; estimated_hours?: number; overrun_pct?: number } | null
                    return (
                      <div key={a.id} className={`${s.anomalyCard} ${isResolved ? s.anomalyResolved : ''}`}>
                        <div className={s.anomalyLeft}>
                          <AlertTriangle size={14} style={{ color: a.severity ? SEVERITY_COLOR[a.severity] : '#94a3b8', flexShrink: 0 }} />
                          <div>
                            <div className={s.anomalyType}>
                              Task #{a.task_id} — {a.type ?? 'anomaly'}
                              {a.severity && (
                                <span className={s.severityBadge} style={{ background: `${SEVERITY_COLOR[a.severity]}22`, color: SEVERITY_COLOR[a.severity] }}>
                                  {a.severity}
                                </span>
                              )}
                            </div>
                            {details && (
                              <div className={s.anomalyDetail}>
                                {details.actual_hours}h logged / {details.estimated_hours}h estimated
                                {details.overrun_pct !== undefined && ` (+${details.overrun_pct}%)`}
                              </div>
                            )}
                            <div className={s.anomalyDate}>
                              Detected {fmt(a.detected_at)}
                              {isResolved && a.resolved_at && ` · Resolved ${fmt(a.resolved_at)}`}
                            </div>
                          </div>
                        </div>
                        {!isResolved && (
                          <Button size="sm" variant="secondary" loading={resolve.isPending} onClick={() => resolve.mutate(a.id)}>
                            Resolve
                          </Button>
                        )}
                        {isResolved && <span className={s.resolvedTag}>Resolved</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
