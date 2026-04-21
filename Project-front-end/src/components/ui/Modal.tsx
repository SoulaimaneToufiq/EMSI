import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import s from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={[s.panel, s[size]].join(' ')} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h2 className={s.title}>{title}</h2>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  )
}
