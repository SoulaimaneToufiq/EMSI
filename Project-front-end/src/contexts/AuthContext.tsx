import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, LoginCredentials } from '@/types'
import { login as loginService, refresh as refreshService } from '@/services/auth.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (creds: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('access_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored) as User)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    setIsLoading(false)
  }, [])

  async function login(creds: LoginCredentials) {
    const response = await loginService(creds)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
