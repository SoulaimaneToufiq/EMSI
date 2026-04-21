import type { AuthResponse, LoginCredentials, SignupCredentials, User } from '@/types'
import { api } from './api'
import { normalizeUser } from './normalizers'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const loginRes = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', credentials)
  const accessToken = loginRes.data.access_token
  const refreshToken = loginRes.data.refresh_token

  // Reuse the freshly issued token to fetch current profile expected by the UI.
  const meRes = await api.get<User>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return { access_token: accessToken, refresh_token: refreshToken, user: normalizeUser(meRes.data) }
}

export async function signup(credentials: SignupCredentials): Promise<void> {
  await api.post('/users/signup', credentials)
}

export async function refresh(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  const res = await api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', { refresh_token: refreshToken })
  const accessToken = res.data.access_token
  const newRefreshToken = res.data.refresh_token

  const meRes = await api.get<User>('/users/me', { headers: { Authorization: `Bearer ${accessToken}` } })
  return { access_token: accessToken, refresh_token: newRefreshToken, user: normalizeUser(meRes.data) }
}
