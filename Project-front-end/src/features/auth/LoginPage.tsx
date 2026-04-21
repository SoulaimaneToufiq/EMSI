import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import s from './LoginPage.module.css'

export function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('admin@piote.io')
  const [password, setPassword] = useState('password')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
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
          <div className={s.formTitle}>Sign in</div>
          <div className={s.formSub}>Enter your work email and password</div>

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
            <div className={s.inputRow}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`${s.input} ${s.inputWithBtn}`}
              />
              <button type="button" className={s.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} size="md" className={s.submitBtn}>
            Continue
          </Button>
        </form>

        <div className={s.demos}>
          <div className={s.demosLabel}>Demo accounts — password: <code>password</code></div>
          <div className={s.demoGrid}>
            {[
              { email: 'admin@piote.io',   label: 'Admin'    },
              { email: 'manager@piote.io', label: 'Manager'  },
              { email: 'alice@piote.io',   label: 'Employee' },
            ].map(({ email: e, label }) => (
              <button key={e} type="button" className={s.demoBtn}
                onClick={() => { setEmail(e); setPassword('password') }}>
                {label}
              </button>
            ))}
          </div>
          <div>Don't have an account? <Link to="/signup">Sign up</Link></div>
        </div>
      </div>
    </div>
  )
}
