import { useState } from 'react'
import { useProjects, useCreateProject } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { ProjectStatusBadge } from '@/components/StatusBadge'
import { TaskStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { DelayIndicator } from '@/components/DelayIndicator'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProjectForm } from './ProjectForm'
import { formatDate } from '@/utils/date'
import type { ProjectFormData } from '@/types'
import { FolderKanban, Users2, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import s from './ProjectsPage.module.css'

export function ProjectsPage() {
  const { user } = useAuth()
  const { data: projects = [], isLoading } = useProjects()
  const { data: allTasks  = [] }           = useTasks()
  const [expanded,    setExpanded]    = useState<number | null>(null)
  const [createOpen,  setCreateOpen]  = useState(false)
  const createProject = useCreateProject()

  const canManage = user?.role === 'admin' || user?.role === 'manager'

  async function handleCreate(data: ProjectFormData) {
    await createProject.mutateAsync(data)
    setCreateOpen(false)
  }

  if (isLoading) return <Spinner />

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.headingTitle}>{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
          <div className={s.headingSub}>All team projects</div>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className={s.empty}>
          <FolderKanban size={32} strokeWidth={1.5} />
          <div className={s.emptyTitle}>No projects yet</div>
          {canManage && (
            <div className={s.emptySub}>Create your first project to get started.</div>
          )}
        </div>
      ) : (
        <div className={s.list}>
          {projects.map(project => {
            const tasks     = allTasks.filter(t => t.project_id === project.id)
            const completed = tasks.filter(t => t.status === 'completed').length
            const delayed   = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.deadline) < new Date()).length
            const pct       = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
            const open      = expanded === project.id

            return (
              <div key={project.id} className={s.projectCard}>
                <button className={s.trigger} onClick={() => setExpanded(open ? null : project.id)}>
                  <div className={s.projectIcon}><FolderKanban size={19} /></div>

                  <div className={s.projectMeta}>
                    <div className={s.projectName}>
                      {project.name}
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className={s.projectDesc}>{project.description}</div>
                  </div>

                  <div className={s.stats}>
                    <div className={s.stat}>
                      <div className={`${s.statVal} ${s.total}`}>{tasks.length}</div>
                      <div className={s.statLabel}>Tasks</div>
                    </div>
                    <div className={s.stat}>
                      <div className={`${s.statVal} ${s.done}`}>{completed}</div>
                      <div className={s.statLabel}>Done</div>
                    </div>
                    {delayed > 0 && (
                      <div className={s.stat}>
                        <div className={`${s.statVal} ${s.late}`}>{delayed}</div>
                        <div className={s.statLabel}>Late</div>
                      </div>
                    )}
                    <div className={s.progressWrap}>
                      <div className={s.progressLabel}><span>Progress</span><span>{pct}%</span></div>
                      <div className={s.progressBar}>
                        <div className={s.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  {project.manager && (
                    <div className={s.manager}>
                      <Users2 size={13} /> {project.manager.name}
                    </div>
                  )}

                  <div className={s.chevron}>
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {open && (
                  <div className={s.taskList}>
                    {tasks.length === 0 ? (
                      <div className={s.taskEmpty}>No tasks in this project yet.</div>
                    ) : (
                      tasks.map(task => {
                        const late = task.status !== 'completed' && task.status !== 'cancelled' && new Date(task.deadline) < new Date()
                        return (
                          <div key={task.id} className={[s.taskRow, late ? s.taskRowLate : ''].join(' ')}>
                            <div className={s.taskInfo}>
                              <div className={s.taskTitle}>{task.title}</div>
                              <div className={s.taskAssignee}>{task.assigned_user?.name}</div>
                            </div>
                            <div className={s.taskMeta}>
                              <span className={s.taskDate}>{formatDate(task.deadline)}</span>
                              <PriorityBadge priority={task.priority} />
                              <TaskStatusBadge status={task.status} />
                              <DelayIndicator task={task} />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Project" size="md">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
