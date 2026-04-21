import type { User } from '@/types'
import { api } from './api'
import { normalizeUsers } from './normalizers'

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return normalizeUsers(data)
}
