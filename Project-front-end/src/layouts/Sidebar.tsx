import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, FolderKanban, Bell, Users, LogOut, Workflow } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import s from './Sidebar.module.css'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/tasks',         icon: CheckSquare,     label: 'Tasks'         },
  { to: '/projects',      icon: FolderKanban,    label: 'Projects'      },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <div className={s.brandIcon}>P</div>
        <span className={s.brandName}>PIOTE</span>
      </div>

      <nav className={s.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [s.navItem, isActive ? s.active : ''].join(' ')}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <>
            <div className={s.section}>Management</div>
            <NavLink
              to="/automation"
              className={({ isActive }) => [s.navItem, isActive ? s.active : ''].join(' ')}
            >
              <Workflow size={15} strokeWidth={1.75} />
              Automation
            </NavLink>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className={s.section}>Admin</div>
            <NavLink
              to="/users"
              className={({ isActive }) => [s.navItem, isActive ? s.active : ''].join(' ')}
            >
              <Users size={15} strokeWidth={1.75} />
              Users
            </NavLink>
          </>
        )}
      </nav>

      <div className={s.footer}>
        <div className={s.userRow}>
          <div className={s.avatar}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
          <div className={s.userInfo}>
            <div className={s.userName}>{user?.name}</div>
            <div className={s.userRole}>{user?.role}</div>
          </div>
          <button className={s.logoutBtn} onClick={logout} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
