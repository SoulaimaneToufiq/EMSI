import { useUsers } from '@/hooks/useUsers'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Shield, Users2 } from 'lucide-react'
import type { UserRole } from '@/types'
import s from './UsersPage.module.css'

const roleColor: Record<UserRole, 'red' | 'blue' | 'gray'> = {
  admin: 'red', manager: 'blue', employee: 'gray',
}

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers()
  if (isLoading) return <Spinner />

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>Team Members</div>
        <div className={s.sub}>{users.length} users</div>
      </div>
      <div className={s.tableWrap}>
        <table>
          <thead>
            <tr>
              <th className={s.th}>Member</th>
              <th className={s.th}>Email</th>
              <th className={s.th}>Role</th>
              <th className={s.th}>Department</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={s.tr}>
                <td className={s.td}>
                  <div className={s.memberCell}>
                    <div className={s.avatar}>{user.name[0].toUpperCase()}</div>
                    <div>
                      <div className={s.memberName}>{user.name}</div>
                      <div className={s.memberId}>#{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className={s.td}><span className={s.email}>{user.email}</span></td>
                <td className={s.td}>
                  <Badge color={roleColor[user.role]}>
                    {user.role === 'admin'   && <Shield  size={10} />}
                    {user.role === 'manager' && <Users2  size={10} />}
                    <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                  </Badge>
                </td>
                <td className={s.td}><span className={s.deptId}>Dept. {user.department_id}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
