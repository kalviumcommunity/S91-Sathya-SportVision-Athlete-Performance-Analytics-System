import { useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, ChevronRight, CircleHelp, ClipboardList, Download, Plus, Search, Users, Zap, Dumbbell } from 'lucide-react'
import { AthleteTable, type Athlete } from './components/AthleteTable'
import { CoachInsight } from './components/CoachInsight'
import { MetricCard } from './components/MetricCard'
import { PerformanceChart } from './components/PerformanceChart'
import { Sidebar, type AppView } from './components/Sidebar'
import './App.css'

const athletes: Athlete[] = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', group: 'U18 · Midfielder', score: 86, change: '+8%', focus: 'Acceleration', tone: 'mint' },
  { id: 'leo', name: 'Leo Martins', initials: 'LM', group: 'U18 · Forward', score: 79, change: '+3%', focus: 'Recovery', tone: 'peach' },
  { id: 'amara', name: 'Amara Okafor', initials: 'AO', group: 'U16 · Defender', score: 83, change: '+6%', focus: 'Strength', tone: 'lilac' },
  { id: 'noah', name: 'Noah Patel', initials: 'NP', group: 'U18 · Goalkeeper', score: 74, change: '−2%', focus: 'Agility', tone: 'yellow' },
]

const sessions = [
  { time: '09:00', title: 'Speed & acceleration', group: 'U18 squad · Pitch 2', icon: Zap },
  { time: '11:30', title: 'Strength foundations', group: 'U16 squad · Gym', icon: Dumbbell },
  { time: '15:00', title: 'Recovery check-in', group: '4 athletes · Performance room', icon: Activity },
]

const viewCopy: Record<AppView, { title: string; subtitle: string }> = {
  overview: { title: 'Good morning, Jordan', subtitle: 'A clear view of your squad’s progress and the next best coaching action.' },
  athletes: { title: 'Athletes', subtitle: 'Review individual progress and find the next development opportunity.' },
  training: { title: 'Training', subtitle: 'Connect assessment findings to focused sessions for your squad.' },
  insights: { title: 'Academy insights', subtitle: 'Spot patterns across the squad and prioritize your coaching time.' },
}

function App() {
  const [activeView, setActiveView] = useState<AppView>('overview')
  const [period, setPeriod] = useState('This month')
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [toast, setToast] = useState('')
  const copy = viewCopy[activeView]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function openAthlete(athlete: Athlete) {
    setSelectedAthlete(athlete)
    setActiveView('athletes')
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onSelect={(view) => { setActiveView(view); setSelectedAthlete(null) }} />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Academy workspace</span><ChevronRight size={14} aria-hidden="true" /><strong>{activeView === 'overview' ? 'Overview' : copy.title}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Search athletes" aria-label="Search athletes" onClick={() => setActiveView('athletes')}><Search size={17} /></button>
            <button className="icon-button notification-button" type="button" title="Notifications" aria-label="Notifications" onClick={() => showToast('You’re all caught up.')}><Bell size={17} /><span /></button>
            <span className="coach-avatar" aria-label="Jordan Miller">JM</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Monday, 16 February 2026 <span className="live-dot" /></p>
              <h1>{selectedAthlete ? selectedAthlete.name : copy.title}</h1>
              <p className="page-subtitle">{selectedAthlete ? `${selectedAthlete.group} · Individual development profile` : copy.subtitle}</p>
            </div>
            <div className="heading-actions">
              {activeView === 'overview' && <label className="period-control"><CalendarDays size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Reporting period"><option>This week</option><option>This month</option><option>This quarter</option></select></label>}
              <button className="secondary-button" type="button" onClick={() => showToast('Your performance report is ready.')}><Download size={15} /> Export</button>
            </div>
          </div>

          {activeView === 'overview' && <Overview period={period} onAthleteSelect={openAthlete} onPlan={() => { setActiveView('training'); showToast('Maya’s acceleration focus was added to training.') }} />}
          {activeView === 'athletes' && <AthleteView selectedAthlete={selectedAthlete} onAthleteSelect={openAthlete} />}
          {activeView === 'training' && <TrainingView onCreate={() => showToast('A new session draft is ready.')} />}
          {activeView === 'insights' && <InsightsView onAthleteSelect={openAthlete} />}
        </div>
      </main>
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  )
}

function Overview({ period, onAthleteSelect, onPlan }: { period: string; onAthleteSelect: (athlete: Athlete) => void; onPlan: () => void }) {
  const score = period === 'This week' ? 79 : period === 'This quarter' ? 84 : 81

  return (
    <>
      <section className="metric-grid" aria-label="Squad summary">
        <MetricCard label="Active athletes" value="24" note="Across 3 age groups" icon={<Users size={17} />} />
        <MetricCard label="Average performance" value={`${score}`} suffix="/100" note="↑ 5.2% vs previous period" icon={<Activity size={17} />} trend="positive" />
        <MetricCard label="Sessions completed" value="18" note="Of 22 scheduled" icon={<ClipboardList size={17} />} />
        <MetricCard label="Needs attention" value="3" note="2 recovery · 1 plateau" icon={<ArrowDownRight size={17} />} trend="caution" />
      </section>

      <section className="overview-grid">
        <PerformanceChart />
        <CoachInsight athlete={athletes[0]} onAction={onPlan} />
      </section>

      <section className="lower-grid">
        <div className="panel roster-panel">
          <div className="panel-heading">
            <div><h2>Athletes to watch</h2><p>Recent progress and coaching focus</p></div>
            <button className="text-button" type="button" onClick={() => onAthleteSelect(athletes[0])}>View roster <ChevronRight size={15} /></button>
          </div>
          <AthleteTable athletes={athletes.slice(0, 3)} onSelect={onAthleteSelect} />
        </div>
        <div className="panel schedule-panel">
          <div className="panel-heading"><div><h2>Today’s sessions</h2><p>Monday · 16 February</p></div><button className="icon-button" type="button" aria-label="Create a session" title="Create a session" onClick={onPlan}><Plus size={17} /></button></div>
          <SessionList />
        </div>
      </section>
    </>
  )
}

function AthleteView({ selectedAthlete, onAthleteSelect }: { selectedAthlete: Athlete | null; onAthleteSelect: (athlete: Athlete) => void }) {
  return (
    <section className="panel full-panel">
      <div className="panel-heading"><div><h2>Squad roster</h2><p>Select an athlete to review their current development focus.</p></div><span className="roster-count">24 athletes</span></div>
      <AthleteTable athletes={athletes} onSelect={onAthleteSelect} selectedId={selectedAthlete?.id} />
      {selectedAthlete && <div className="selected-note"><strong>{selectedAthlete.focus} focus</strong><span>Recommended next step: review recent assessments and add a focused block to the next training plan.</span></div>}
    </section>
  )
}

function TrainingView({ onCreate }: { onCreate: () => void }) {
  return (
    <>
      <div className="training-toolbar"><span className="roster-count">Monday · 16 February</span><button className="primary-button" type="button" onClick={onCreate}><Plus size={16} /> Create session</button></div>
      <section className="session-grid">
        {sessions.map(({ time, title, group, icon: Icon }) => <article className="panel session-card" key={title}><div className="session-icon"><Icon size={18} /></div><p className="session-time">{time}</p><h2>{title}</h2><p className="session-group">{group}</p><div className="session-footer"><span>4 drills · 55 min</span><button type="button" className="text-button" onClick={onCreate}>Edit session <ChevronRight size={15} /></button></div></article>)}
      </section>
    </>
  )
}

function InsightsView({ onAthleteSelect }: { onAthleteSelect: (athlete: Athlete) => void }) {
  return (
    <>
      <section className="metric-grid insight-metrics">
        <MetricCard label="Squad score change" value="+5.2%" note="Compared with previous month" icon={<ArrowUpRight size={17} />} trend="positive" />
        <MetricCard label="Strongest area" value="Endurance" note="Average score · 84 / 100" icon={<Activity size={17} />} />
        <MetricCard label="Coaching opportunity" value="Recovery" note="3 athletes flagged for check-in" icon={<CircleHelp size={17} />} trend="caution" />
        <MetricCard label="Assessments this month" value="38" note="Across 3 age groups" icon={<ClipboardList size={17} />} />
      </section>
      <div className="overview-grid insights-lower"><PerformanceChart /><div className="panel focus-panel"><div className="panel-heading"><div><h2>Development opportunities</h2><p>Suggested follow-ups</p></div></div>{athletes.slice(0, 3).map((athlete) => <button className="focus-row" type="button" key={athlete.id} onClick={() => onAthleteSelect(athlete)}><span className={`athlete-avatar ${athlete.tone}`}>{athlete.initials}</span><span className="focus-name"><strong>{athlete.name}</strong><small>{athlete.focus} focus</small></span><ChevronRight size={16} /></button>)}</div></div>
    </>
  )
}

function SessionList() {
  return <div className="session-list">{sessions.map(({ time, title, group, icon: Icon }) => <div className="session-row" key={title}><span className="session-clock">{time}</span><span className="session-type"><Icon size={15} /><span><strong>{title}</strong><small>{group}</small></span></span></div>)}</div>
}

export default App
