import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react'

export interface Athlete {
  id: string
  name: string
  initials: string
  group: string
  score: number
  change: string
  focus: string
  tone: 'mint' | 'peach' | 'lilac' | 'yellow'
}

interface AthleteTableProps {
  athletes: Athlete[]
  onSelect: (athlete: Athlete) => void
  selectedId?: string
}

export function AthleteTable({ athletes, onSelect, selectedId }: AthleteTableProps) {
  return (
    <div className="table-scroll">
      <table className="athlete-table">
        <thead><tr><th scope="col">Athlete</th><th scope="col">Performance</th><th scope="col">Change</th><th scope="col">Focus</th><th scope="col"><span className="visually-hidden">Open profile</span></th></tr></thead>
        <tbody>{athletes.map((athlete) => <tr key={athlete.id} className={selectedId === athlete.id ? 'selected-row' : ''}>
          <td><button className="athlete-identity" type="button" onClick={() => onSelect(athlete)}><span className={`athlete-avatar ${athlete.tone}`}>{athlete.initials}</span><span className="athlete-name"><strong>{athlete.name}</strong><small>{athlete.group}</small></span></button></td>
          <td><span className="score-number">{athlete.score}</span><span className="score-total"> / 100</span></td>
          <td><span className={`change-value ${athlete.change.startsWith('−') ? 'change-down' : ''}`}>{athlete.change.startsWith('−') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{athlete.change}</span></td>
          <td><span className="focus-pill">{athlete.focus}</span></td>
          <td><button className="row-action" type="button" aria-label={`Open ${athlete.name} profile`} onClick={() => onSelect(athlete)}><ChevronRight size={17} /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}