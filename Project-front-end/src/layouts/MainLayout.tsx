import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import s from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={s.shell}>
      <Sidebar />
      <div className={s.main}>
        <Topbar />
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
