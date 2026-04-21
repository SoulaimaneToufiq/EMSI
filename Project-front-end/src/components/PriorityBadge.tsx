import type { TaskPriority } from '@/types'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import s from './PriorityBadge.module.css'

const config = {
  low:    { label: 'Low',    Icon: ArrowDown  },
  medium: { label: 'Medium', Icon: ArrowRight },
  high:   { label: 'High',   Icon: ArrowUp    },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, Icon } = config[priority]
  return (
    <span className={[s.badge, s[priority]].join(' ')}>
      <Icon size={10} />
      {label}
    </span>
  )
}
