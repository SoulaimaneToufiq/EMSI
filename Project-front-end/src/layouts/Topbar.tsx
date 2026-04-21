import { useLocation } from 'react-router-dom'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { useAuth } from '@/contexts/AuthContext'
import s from './Topbar.module.css'

const titles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/tasks':         'Tasks',
  '/projects':      'Projects',
  '/notifications': 'Notifications',
  '/users':         'Users',
}

export function Topbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = Object.entries(titles).find(([p]) => pathname.startsWith(p))?.[1] ?? 'PIOTE'

  return (
    <header className={s.topbar}>
      <div className={s.left}>
        <div className={s.pageTitle}>{title}</div>
        <div className={s.breadcrumb}>{user?.role} · {user?.name}</div>
      </div>
      <div className={s.right}>
        <NotificationDropdown />
        <div className={s.userChip}>
          <div className={s.avatar}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
          <span className={s.userName}>{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
