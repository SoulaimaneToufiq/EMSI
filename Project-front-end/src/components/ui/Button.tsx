import { type ButtonHTMLAttributes, forwardRef } from 'react'
import s from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const cls = [s.btn, s[variant], s[size], className].filter(Boolean).join(' ')
    return (
      <button ref={ref} disabled={disabled || loading} className={cls} {...props}>
        {loading && <span className={s.spinner} />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
