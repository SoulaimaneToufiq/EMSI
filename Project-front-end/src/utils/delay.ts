import type { Task } from '@/types'

/** Returns the number of days a task is overdue (0 if not late) */
export function daysLate(task: Task): number {
  if (task.status === 'completed' || task.status === 'cancelled') return 0
  const deadline = new Date(task.deadline)
  const now = new Date()
  // zero out time part for clean day diff
  deadline.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = Math.floor((now.getTime() - deadline.getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

export function isLate(task: Task): boolean {
  return daysLate(task) > 0
}

export function isAtRisk(task: Task): boolean {
  if (task.status === 'completed' || task.status === 'cancelled') return false
  const deadline = new Date(task.deadline)
  const now = new Date()
  const diff = Math.floor((deadline.getTime() - now.getTime()) / 86400000)
  return diff >= 0 && diff <= 3 // due within 3 days
}
