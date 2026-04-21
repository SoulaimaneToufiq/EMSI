import type { TaskStatus, ProjectStatus } from '@/types'
import s from './StatusBadge.module.css'

const taskLabels: Record<TaskStatus, string> = {
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const projectLabels: Record<ProjectStatus, string> = {
  active:    'Active',
  on_hold:   'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={[s.badge, s[status]].join(' ')}>
      <span className={s.dot} />
      {taskLabels[status]}
    </span>
  )
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={[s.badge, s[status]].join(' ')}>
      <span className={s.dot} />
      {projectLabels[status]}
    </span>
  )
}
