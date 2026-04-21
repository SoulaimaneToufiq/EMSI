import { useState } from 'react'
import type { TaskFilters, TaskFormData } from '@/types'
import { useTasks, useCreateTask } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { TaskTable } from './TaskTable'
import { KanbanBoard } from './KanbanBoard'
import { TaskFiltersBar } from './TaskFilters'
import { TaskForm } from './TaskForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, LayoutList, Kanban } from 'lucide-react'
import s from './TasksPage.module.css'

type View = 'table' | 'kanban'

export function TasksPage() {
  const { user } = useAuth()
  const [view,       setView]       = useState<View>('table')
  const [filters,    setFilters]    = useState<TaskFilters>({})
  const [createOpen, setCreateOpen] = useState(false)

  const effectiveFilters: TaskFilters =
    user?.role === 'employee' ? { ...filters, assigned_to: user.id } : filters

  const { data: tasks = [], isLoading, error } = useTasks(effectiveFilters)
  const createTask = useCreateTask()

  async function handleCreate(data: TaskFormData) {
    await createTask.mutateAsync(data)
    setCreateOpen(false)
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.headingTitle}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
          <div className={s.headingSub}>{user?.role === 'employee' ? 'Your assigned tasks' : 'All team tasks'}</div>
        </div>
        <div className={s.headerRight}>
          <div className={s.viewToggle}>
            <button className={`${s.toggleBtn} ${view === 'table' ? s.active : ''}`} onClick={() => setView('table')}>
              <LayoutList size={14} /> Table
            </button>
            <button className={`${s.toggleBtn} ${view === 'kanban' ? s.active : ''}`} onClick={() => setView('kanban')}>
              <Kanban size={14} /> Kanban
            </button>
          </div>
          {user?.role !== 'employee' && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> New task
            </Button>
          )}
        </div>
      </div>

      <TaskFiltersBar filters={filters} onChange={setFilters} />

      {isLoading && <Spinner />}
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>Failed to load tasks.</p>}
      {!isLoading && !error && (
        view === 'table' ? <TaskTable tasks={tasks} /> : <KanbanBoard tasks={tasks} />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Task" size="lg">
        <TaskForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
