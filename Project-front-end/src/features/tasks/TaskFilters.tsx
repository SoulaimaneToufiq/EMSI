import type { TaskFilters } from '@/types'
import { useProjects } from '@/hooks/useProjects'
import { useUsers } from '@/hooks/useUsers'
import { Search, X } from 'lucide-react'
import s from './TaskFilters.module.css'

interface Props {
  filters: TaskFilters
  onChange: (f: TaskFilters) => void
}

export function TaskFiltersBar({ filters, onChange }: Props) {
  const { data: projects = [] } = useProjects()
  const { data: users    = [] } = useUsers()
  const set = (partial: Partial<TaskFilters>) => onChange({ ...filters, ...partial })
  const hasFilters = !!(filters.status || filters.priority || filters.assigned_to || filters.project_id || filters.search)

  return (
    <div className={s.bar}>
      <div className={s.searchWrap}>
        <Search size={13} className={s.searchIcon} />
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search ?? ''}
          onChange={e => set({ search: e.target.value })}
          className={s.search}
        />
      </div>

      <select value={filters.status ?? ''} onChange={e => set({ status: e.target.value as TaskFilters['status'] })} className={s.select}>
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="review">Review</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select value={filters.priority ?? ''} onChange={e => set({ priority: e.target.value as TaskFilters['priority'] })} className={s.select}>
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select value={filters.assigned_to ?? ''} onChange={e => set({ assigned_to: e.target.value ? Number(e.target.value) : '' })} className={s.select}>
        <option value="">All Members</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>

      <select value={filters.project_id ?? ''} onChange={e => set({ project_id: e.target.value ? Number(e.target.value) : '' })} className={s.select}>
        <option value="">All Projects</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {hasFilters && (
        <button onClick={() => onChange({})} className={s.clearBtn}>
          <X size={13} /> Clear
        </button>
      )}
    </div>
  )
}
