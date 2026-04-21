import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { signup as signupService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/types'
import s from './LoginPage.module.css' // Reuse styles

export function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signupService({ email, password, role })
      // Auto login after signup
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.top}>
          <div className={s.logo}>P</div>
          <div>
            <div className={s.appName}>PIOTE</div>
            <div className={s.appSub}>Task management platform</div>
          </div>
        </div>

        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.formTitle}>Sign up</div>
          <div className={s.formSub}>Create your account</div>

          {error && <div className={s.error}>{error}</div>}

          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              className={s.input}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={s.input}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={s.input}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              required
              className={s.input}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" loading={loading} size="md" className={s.submitBtn}>
            Create Account
          </Button>
        </form>

        <div className={s.demos}>
          <div>Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  )
}