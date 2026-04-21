import type { Task, TaskStatus } from '@/types'
import { PriorityBadge } from '@/components/PriorityBadge'
import { DelayIndicator } from '@/components/DelayIndicator'
import { formatDate } from '@/utils/date'
import { isLate } from '@/utils/delay'
import { Calendar, User2, FolderDot } from 'lucide-react'
import s from './KanbanBoard.module.css'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo',        label: 'To Do'       },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'review',      label: 'Review'      },
  { status: 'completed',   label: 'Completed'   },
]

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div className={s.board}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status)
        return (
          <div key={col.status} className={`${s.column} ${s[`col-${col.status}`]}`}>
            <div className={s.colHeader}>
              <span className={s.colTitle}>{col.label}</span>
              <span className={s.colCount}>{colTasks.length}</span>
            </div>
            <div className={s.cards}>
              {colTasks.length === 0 && <div className={s.empty}>No tasks</div>}
              {colTasks.map(task => (
                <div key={task.id} className={[s.card, isLate(task) ? s.cardLate : ''].join(' ')}>
                  <div className={s.cardBadges}>
                    <PriorityBadge priority={task.priority} />
                    <DelayIndicator task={task} />
                  </div>
                  <div className={s.cardTitle}>{task.title}</div>
                  <div className={s.cardDesc}>{task.description}</div>
                  <div className={s.cardFooter}>
                    <div className={s.assigneeChip}>
                      <div className={s.cardAvatar}>{task.assigned_user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                      <span>{task.assigned_user?.name ?? '—'}</span>
                    </div>
                    <div className={[s.deadlineChip, isLate(task) ? s.deadlineLate : ''].join(' ')}>
                      <Calendar size={11} />
                      {formatDate(task.deadline)}
                    </div>
                  </div>
                  {task.project && (
                    <div className={s.projectTag}>
                      <FolderDot size={11} />
                      {task.project.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
