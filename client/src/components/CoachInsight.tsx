import { ArrowRight, Sparkles } from 'lucide-react'
import type { Athlete } from './AthleteTable'

interface CoachInsightProps {
  athlete: Athlete
  onAction: () => void
}

export function CoachInsight({ athlete, onAction }: CoachInsightProps) {
  return (
    <aside className="insight-panel">
      <div className="insight-topline"><span className="insight-label"><Sparkles size={13} /> Coach insight</span><span className="insight-confidence">Development opportunity</span></div>
      <h2>{athlete.name}’s endurance is up 12% this month</h2>
      <p>Her speed score has stayed flat. A short acceleration block could turn recent conditioning gains into stronger match-day performance.</p>
      <button className="insight-action" type="button" onClick={onAction}>Add focus to training <ArrowRight size={16} /></button>
      <div className="insight-footer"><span className="insight-avatar">{athlete.initials}</span><span>Based on Maya’s latest 8 assessments</span></div>
    </aside>
  )
}