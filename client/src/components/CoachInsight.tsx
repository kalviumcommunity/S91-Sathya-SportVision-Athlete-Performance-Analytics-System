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
      <h2>{athlete.name}’s latest score is {athlete.score}/100</h2>
      <p>The latest saved assessment highlights {athlete.focus.toLowerCase()}. Review the athlete’s assessment history before choosing a training focus.</p>
      <button className="insight-action" type="button" onClick={onAction}>Add focus to training <ArrowRight size={16} /></button>
      <div className="insight-footer"><span className="insight-avatar">{athlete.initials}</span><span>Based on the latest saved assessment</span></div>
    </aside>
  )
}