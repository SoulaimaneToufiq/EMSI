import { useState, type FormEvent } from 'react'
import type { ProjectFormData } from '@/types'
import { useUsers } from '@/hooks/useUsers'
import { Button } from '@/components/ui/Button'
import s from '../tasks/TaskForm.module.css'

interface Props {
  onSubmit: (data: ProjectFormData) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ onSubmit, onCancel }: Props) {
  const { data: users = [] } = useUsers()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState<ProjectFormData>({
    name:        '',
    description: '',
    manager_id:  '',
    start_date:  '',
    end_date:    '',
    status:      'active',
  })

  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    setError('')
    setLoading(true)
    try {
      await onSubmit(form)
    } catch {
      setError('Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      {error && <div className={s.error}>{error}</div>}

      <div className={s.field}>
        <label className={s.label}>Name *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className={s.input}
          placeholder="Project name…"
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          className={s.textarea}
          placeholder="Describe the project…"
        />
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Manager</label>
          <select
            value={form.manager_id}
            onChange={e => set('manager_id', e.target.value ? Number(e.target.value) : '')}
            className={s.select}
          >
            <option value="">No manager</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.label}>Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as ProjectFormData['status'])}
            className={s.select}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={s.row}>
        <div className={s.field}>
          <label className={s.label}>Start date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => set('start_date', e.target.value)}
            className={s.input}
          />
        </div>
        <div className={s.field}>
          <label className={s.label}>End date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => set('end_date', e.target.value)}
            className={s.input}
          />
        </div>
      </div>

      <div className={s.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create project</Button>
      </div>
    </form>
  )
}
