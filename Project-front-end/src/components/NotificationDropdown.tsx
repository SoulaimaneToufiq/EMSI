import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { timeAgo } from '@/utils/date'
import s from './NotificationDropdown.module.css'

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications = [] } = useNotifications()
  const markAsRead    = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={s.wrap}>
      <button className={s.trigger} onClick={() => setOpen(o => !o)}>
        <Bell size={16} />
        {unread > 0 && (
          <span className={s.badge}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={s.dropdown}>
          <div className={s.header}>
            <span className={s.headerTitle}>Notifications</span>
            {unread > 0 && (
              <button className={s.markAllBtn} onClick={() => markAllAsRead.mutate()}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className={s.list}>
            {notifications.length === 0 ? (
              <p className={s.empty}>You're all caught up!</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={[s.item, !n.is_read ? s.unread : ''].join(' ')}
                  onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                >
                  <span className={[s.dot, n.is_read ? s.read : s.unread].join(' ')} />
                  <div className={s.itemContent}>
                    <p className={s.message}>{n.message}</p>
                    <div className={s.meta}>
                      <span className={s.time}>{timeAgo(n.created_at)}</span>
                      {n.related_task && (
                        <span className={s.taskRef}>
                          <ExternalLink size={10} />
                          {n.related_task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
