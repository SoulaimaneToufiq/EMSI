import type { Task } from '@/types'
import { daysLate, isAtRisk } from '@/utils/delay'
import s from './DelayIndicator.module.css'

export function DelayIndicator({ task }: { task: Task }) {
  const late = daysLate(task)

  if (late > 0) {
    return (
      <span className={s.late}>
        {late}d overdue
        {task.consecutive_delays > 1 && (
          <span className={s.streak}>(×{task.consecutive_delays})</span>
        )}
      </span>
    )
  }

  if (isAtRisk(task)) {
    return <span className={s.soon}>Due soon</span>
  }

  return null
}
