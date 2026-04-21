import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { timeAgo } from '@/utils/date'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import s from './NotificationsPage.module.css'

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAsRead    = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const unread        = notifications.filter(n => !n.is_read).length

  if (isLoading) return <Spinner />

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <div className={s.title}>Notifications</div>
          <div className={s.sub}>{unread} unread</div>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAllAsRead.mutate()} loading={markAllAsRead.isPending}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}><Bell size={40} /></div>
          <div className={s.emptyTitle}>You're all caught up!</div>
          <div className={s.emptySub}>No notifications to display.</div>
        </div>
      ) : (
        <div className={s.list}>
          {notifications.map(n => (
            <div
              key={n.id}
              className={[s.item, !n.is_read ? s.itemUnread : ''].join(' ')}
              onClick={() => !n.is_read && markAsRead.mutate(n.id)}
            >
              <div className={[s.dot, !n.is_read ? s.dotUnread : ''].join(' ')} />
              <div className={s.content}>
                <p className={[s.message, !n.is_read ? s.messageUnread : ''].join(' ')}>{n.message}</p>
                <div className={s.meta}>
                  <span className={s.time}>{timeAgo(n.created_at)}</span>
                  {n.related_task && (
                    <span className={s.taskRef}>
                      <ExternalLink size={11} /> {n.related_task.title}
                    </span>
                  )}
                </div>
              </div>
              {!n.is_read && <span className={s.newBadge}>New</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
