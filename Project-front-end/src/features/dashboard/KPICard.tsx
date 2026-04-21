import type { ReactNode } from 'react'
import s from './KPICard.module.css'

interface KPICardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export function KPICard({ label, value, icon, trend, color = 'blue' }: KPICardProps) {
  return (
    <div className={[s.card, s[color]].join(' ')}>
      <div className={s.label}>
        {label}
        <span className={s.iconWrap}>{icon}</span>
      </div>
      <div className={s.value}>{value}</div>
      {trend && <div className={s.trend}>{trend}</div>}
    </div>
  )
}
