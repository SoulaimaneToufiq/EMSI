import s from './Spinner.module.css'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={[s.wrap, className].filter(Boolean).join(' ')}>
      <div className={s.ring} />
    </div>
  )
}
