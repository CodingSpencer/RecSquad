import type { ReactNode } from 'react'
import type { Group } from '../types'

export function Page({ title, children, action, narrow = false }: { title?: string; children: ReactNode; action?: ReactNode; narrow?: boolean }) {
  return <section className={`page ${narrow ? 'page-narrow' : ''}`}>
    {(title || action) && <header className="page-heading">{title && <h1>{title}</h1>}{action}</header>}
    {children}
  </section>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return <p className="error-message" role="alert">{children}</p>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}

export function Loading() {
  return <p className="muted loading-state" role="status">Loading...</p>
}

export function GroupAvatar({ group, large = false }: { group: Group; large?: boolean }) {
  return group.image_url
    ? <img className={`avatar ${large ? 'avatar-large' : ''}`} src={group.image_url} alt="" />
    : <span className={`avatar ${large ? 'avatar-large' : ''}`}>{group.name.trim().charAt(0).toUpperCase()}</span>
}
