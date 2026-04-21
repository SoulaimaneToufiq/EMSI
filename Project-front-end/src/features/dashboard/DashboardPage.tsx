import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { CheckSquare, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { KPICard } from './KPICard'
import { Spinner } from '@/components/ui/Spinner'
import s from './DashboardPage.module.css'

const STATUS_COLORS: Record<string, string> = {
  todo:        '#94a3b8',
  in_progress: '#2563eb',
  review:      '#7c3aed',
  completed:   '#16a34a',
  cancelled:   '#e2e8f0',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', review: 'Review',
  completed: 'Completed', cancelled: 'Cancelled',
}

const tip = {
  backgroundColor: '#fff',
  border: '1px solid #e2e2df',
  borderRadius: 6,
  color: '#18181b',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}

export function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboard()

  if (isLoading) return <Spinner />
  if (error || !stats) return <p style={{ color: 'var(--red)', fontSize: 13 }}>Failed to load stats{error ? `: ${error.message}` : ''}.</p>

  const pieData = stats.tasks_by_status.map(d => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? '#94a3b8',
  }))

  return (
    <div className={s.page}>
      <div className={s.kpiGrid}>
        <KPICard label="Total Tasks"  value={stats.total_tasks}    icon={<CheckSquare size={16} />} color="blue" />
        <KPICard label="Completed"    value={stats.completed_tasks} icon={<TrendingUp  size={16} />} color="green" trend={`${stats.completion_rate}% rate`} />
        <KPICard label="Overdue"      value={stats.delayed_tasks}   icon={<AlertTriangle size={16} />} color="red" />
        <KPICard label="In Progress"  value={stats.tasks_by_status.find(s => s.status === 'in_progress')?.count ?? 0} icon={<Clock size={16} />} color="yellow" />
      </div>

      <div className={s.chartsRow}>
        <div className={s.chartCard}>
          <div className={s.chartTitle}>By status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={tip} formatter={(v) => [v, 'tasks']} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: '#71717a' }}>{v}</span>} iconType="circle" iconSize={7} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={s.chartCard}>
          <div className={s.chartTitle}>By project</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.tasks_by_project} barGap={3} barSize={12}>
              <XAxis dataKey="project" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: '#71717a' }}>{v}</span>} iconType="circle" iconSize={7} />
              <Bar dataKey="count"     name="Total"     fill="#2563eb" radius={[3,3,0,0]} />
              <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={s.chartCard}>
        <div className={s.chartTitle}>By employee</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.tasks_by_employee} barGap={3} barSize={12}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Legend formatter={v => <span style={{ fontSize: 11, color: '#71717a' }}>{v}</span>} iconType="circle" iconSize={7} />
            <Bar dataKey="total"     name="Total"     fill="#2563eb" radius={[3,3,0,0]} />
            <Bar dataKey="completed" name="Completed" fill="#16a34a" radius={[3,3,0,0]} />
            <Bar dataKey="delayed"   name="Overdue"   fill="#dc2626" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
