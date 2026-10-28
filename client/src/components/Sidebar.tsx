import { Activity, CalendarDays, ChartNoAxesCombined, Users, type LucideIcon } from 'lucide-react'

export type AppView = 'overview' | 'athletes' | 'training' | 'insights'

const navigation: { view: AppView; label: string; icon: LucideIcon }[] = [
  { view: 'overview', label: 'Overview', icon: ChartNoAxesCombined },
  { view: 'athletes', label: 'Athletes', icon: Users },
  { view: 'training', label: 'Training', icon: CalendarDays },
  { view: 'insights', label: 'Insights', icon: Activity },
]

interface SidebarProps {
  activeView: AppView
  onSelect: (view: AppView) => void
}

export function Sidebar({ activeView, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); onSelect('overview') }}>
        <span className="brand-mark">S</span><span>SportVision</span>
      </a>
      <p className="sidebar-label">Academy workspace</p>
      <nav className="primary-nav" aria-label="Main navigation">
        {navigation.map(({ view, label, icon: Icon }) => <button className={`nav-item ${activeView === view ? 'is-active' : ''}`} type="button" key={view} aria-current={activeView === view ? 'page' : undefined} onClick={() => onSelect(view)}><Icon size={17} /><span>{label}</span></button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="season-card"><span className="season-kicker">Current season</span><strong>2025–26</strong><small>U18 Development · Week 08</small></div>
        <div className="coach-profile"><span className="coach-avatar">JM</span><span><strong>Jordan Miller</strong><small>Performance coach</small></span><span className="coach-status" aria-label="Online" /></div>
      </div>
    </aside>
  )
}