import { useState } from 'react'
import type { Task, TaskFormData } from '@/types'
import { TaskStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { DelayIndicator } from '@/components/DelayIndicator'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TaskForm } from './TaskForm'
import { TaskHistory } from './TaskHistory'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { formatDate } from '@/utils/date'
import { isLate } from '@/utils/delay'
import { Pencil, Trash2, History, ChevronUp, ChevronDown } from 'lucide-react'
import s from './TaskTable.module.css'

type SortKey = 'title' | 'deadline' | 'priority' | 'status'
type SortDir = 'asc' | 'desc'
const PO = { low: 0, medium: 1, high: 2 }

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [editTask,    setEditTask]    = useState<Task | null>(null)
  const [historyTask, setHistoryTask] = useState<Task | null>(null)
  const [confirmDel,  setConfirmDel]  = useState<Task | null>(null)
  const [sortKey,  setSortKey]  = useState<SortKey>('deadline')
  const [sortDir,  setSortDir]  = useState<SortDir>('asc')

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'deadline') cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    if (sortKey === 'priority') cmp = PO[a.priority] - PO[b.priority]
    if (sortKey === 'status')   cmp = a.status.localeCompare(b.status)
    if (sortKey === 'title')    cmp = a.title.localeCompare(b.title)
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    const active = sortKey === k
    const Icon = (active && sortDir === 'desc') ? ChevronDown : ChevronUp
    return <Icon size={12} style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }} />
  }

  async function handleUpdate(data: TaskFormData) {
    if (!editTask) return
    await updateTask.mutateAsync({ id: editTask.id, data })
    setEditTask(null)
  }

  async function handleDelete() {
    if (!confirmDel) return
    await deleteTask.mutateAsync(confirmDel.id)
    setConfirmDel(null)
  }

  return (
    <>
      <div className={s.tableWrap}>
        <table>
          <thead className={s.thead}>
            <tr>
              <th className={`${s.th} ${s.thSortable}`} onClick={() => toggleSort('title')}>
                <div className={s.thInner}>Task <SortIcon k="title" /></div>
              </th>
              <th className={s.th}>Assignee</th>
              <th className={s.th}>Project</th>
              <th className={`${s.th} ${s.thSortable}`} onClick={() => toggleSort('deadline')}>
                <div className={s.thInner}>Deadline <SortIcon k="deadline" /></div>
              </th>
              <th className={`${s.th} ${s.thSortable}`} onClick={() => toggleSort('priority')}>
                <div className={s.thInner}>Priority <SortIcon k="priority" /></div>
              </th>
              <th className={`${s.th} ${s.thSortable}`} onClick={() => toggleSort('status')}>
                <div className={s.thInner}>Status <SortIcon k="status" /></div>
              </th>
              <th className={s.th}>Delay</th>
              <th className={s.th} />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={8} className={s.empty}>No tasks found</td></tr>
            )}
            {sorted.map(task => (
              <tr key={task.id} className={[s.tr, isLate(task) ? s.trLate : ''].join(' ')}>
                <td className={s.td}>
                  <div className={s.taskTitle}>{task.title}</div>
                  <div className={s.taskDesc}>{task.description}</div>
                </td>
                <td className={s.td}>
                  <div className={s.assignee}>
                    <div className={s.userAvatar}>{task.assigned_user?.name?.[0]?.toUpperCase() ?? '?'}</div>
                    <span className={s.assigneeName}>{task.assigned_user?.name ?? '—'}</span>
                  </div>
                </td>
                <td className={s.td}>
                  <span className={s.projectName}>{task.project?.name ?? '—'}</span>
                </td>
                <td className={s.td}>
                  <span className={[s.deadline, isLate(task) ? s.deadlineLate : ''].join(' ')}>
                    {formatDate(task.deadline)}
                  </span>
                </td>
                <td className={s.td}><PriorityBadge priority={task.priority} /></td>
                <td className={s.td}><TaskStatusBadge status={task.status} /></td>
                <td className={s.td}><DelayIndicator task={task} /></td>
                <td className={s.td}>
                  <div className={s.actions}>
                    <button className={s.actionBtn} onClick={() => setHistoryTask(task)} title="History">
                      <History size={14} />
                    </button>
                    <button className={`${s.actionBtn} ${s.edit}`} onClick={() => setEditTask(task)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className={`${s.actionBtn} ${s.del}`} onClick={() => setConfirmDel(task)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editTask}    onClose={() => setEditTask(null)}    title="Edit Task"                         size="lg">
        {editTask && <TaskForm initial={editTask} onSubmit={handleUpdate} onCancel={() => setEditTask(null)} />}
      </Modal>
      <Modal open={!!historyTask} onClose={() => setHistoryTask(null)} title={`History · ${historyTask?.title}`} size="md">
        {historyTask && <TaskHistory taskId={historyTask.id} />}
      </Modal>
      <Modal open={!!confirmDel}  onClose={() => setConfirmDel(null)}  title="Delete Task"                       size="sm">
        <p className={s.confirmText}>Delete <strong>"{confirmDel?.title}"</strong>? This cannot be undone.</p>
        <div className={s.confirmActions}>
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteTask.isPending}>Delete</Button>
        </div>
      </Modal>
    </>
  )
}
