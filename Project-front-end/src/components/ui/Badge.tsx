import { type ReactNode } from 'react'
import s from './Badge.module.css'

type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'orange'

interface BadgeProps {
  color?: Color
  children: ReactNode
  className?: string
}

export function Badge({ color = 'gray', children, className }: BadgeProps) {
  return (
    <span className={[s.badge, s[color], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
