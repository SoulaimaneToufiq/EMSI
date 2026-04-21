import { useTaskHistory } from '@/hooks/useTasks'
import { formatDateTime, formatDate } from '@/utils/date'
import { Spinner } from '@/components/ui/Spinner'
import { ArrowRight, GitCommitHorizontal } from 'lucide-react'
import s from './TaskHistory.module.css'

const FIELD_LABELS: Record<string, string> = {
  status: 'Status', priority: 'Priority', deadline: 'Deadline',
  assigned_to: 'Assignee', estimated_hours: 'Est. hours',
  actual_hours: 'Actual hours', title: 'Title', description: 'Description',
}

function fmtVal(field: string, val: string) {
  if (field === 'deadline') { try { return formatDate(val) } catch { return val } }
  return val
}

export function TaskHistory({ taskId }: { taskId: number }) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)
  if (isLoading) return <Spinner />
  if (history.length === 0) return <p className={s.empty}>No history recorded yet.</p>

  return (
    <div className={s.wrap}>
      <div className={s.line} />
      <div className={s.list}>
        {history.map(entry => (
          <div key={entry.id} className={s.item}>
            <div className={s.dot}><GitCommitHorizontal size={14} /></div>
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.fieldName}>{FIELD_LABELS[entry.field_changed] ?? entry.field_changed} changed</span>
                <span className={s.time}>{formatDateTime(entry.changed_at)}</span>
              </div>
              <div className={s.change}>
                <span className={s.oldVal}>{fmtVal(entry.field_changed, entry.old_value)}</span>
                <ArrowRight size={13} className={s.arrow} />
                <span className={s.newVal}>{fmtVal(entry.field_changed, entry.new_value)}</span>
              </div>
              {entry.changer && <p className={s.by}>by {entry.changer.name}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
