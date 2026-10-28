import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string
  note: string
  icon: ReactNode
  suffix?: string
  trend?: 'positive' | 'caution'
}

export function MetricCard({ label, value, note, icon, suffix, trend }: MetricCardProps) {
  return (
    <article className={`metric-card ${trend ? `metric-${trend}` : ''}`}>
      <div className="metric-head"><span>{label}</span><span className="metric-icon">{icon}</span></div>
      <div className="metric-value">{value}{suffix && <span>{suffix}</span>}</div>
      <p className="metric-note">{note}</p>
    </article>
  )
}