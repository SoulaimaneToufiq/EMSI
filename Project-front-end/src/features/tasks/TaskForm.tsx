import { useState, type FormEvent } from 'react'
import type { Task, TaskFormData } from '@/types'
import { useUsers } from '@/hooks/useUsers'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import s from './TaskForm.module.css'

interface Props {
  initial?: Task
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
}

export function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const { data: users    = [] } = useUsers()
  const { data: projects = [] } = useProjects()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState<TaskFormData>({
    title:           initial?.title           ?? '',
    description:     initial?.description     ?? '',
    assigned_to:     initial?.assigned_to     ?? (users[0]?.id ?? 0),
    project_id:      initial?.project_id      ?? (projects[0]?.id ?? 0),
    deadline:        initial?.deadline        ? initial.deadline.slice(0, 10) : '',
    priority:        initial?.priority        ?? 'medium',
    estimated_hours: initial?.estimated_hours ?? 4,
    status:          initial?.status          ?? 'todo',
  })

  const set = <K extends keyof TaskFormData>(k: K, v: TaskFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    if (!form.deadline)     return setError('Deadline is required')
    setError('')
    setLoading(true)
    try {
      await onSubmit(form)
    } catch {
      setError('Failed to save task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {error && <div className={s.error}>{error}</div>}

      <div className={s.field}>
        <label className={s.label}>Title *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} className={s.input} placeholder="Task title…" />
      </div>

      <div className={s.field}>
        <label className={s.label}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className={s.textarea} placeholder="Describe the task…" />
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Assign to *</label>
          <select value={form.assigned_to} onChange={e => set('assigned_to', Number(e.target.value))} className={s.select}>
            <option value="">Select user…</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>Project *</label>
          <select value={form.project_id} onChange={e => set('project_id', Number(e.target.value))} className={s.select}>
            <option value="">Select project…</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Deadline *</label>
          <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={s.input} />
        </div>
        <div className={s.field}>
          <label className={s.label}>Estimated hours</label>
          <input type="number" min={0.5} step={0.5} value={form.estimated_hours} onChange={e => set('estimated_hours', Number(e.target.value))} className={s.input} />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value as TaskFormData['priority'])} className={s.select}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as TaskFormData['status'])} className={s.select}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={s.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save changes' : 'Create task'}</Button>
      </div>
    </form>
  )
}
