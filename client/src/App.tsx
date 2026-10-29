import { useEffect, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, ChevronRight, CircleHelp, ClipboardList, Download, Plus, Search, Users, Zap, Dumbbell } from 'lucide-react'
import { AthleteTable, type Athlete } from './components/AthleteTable'
import { CoachInsight } from './components/CoachInsight'
import { MetricCard } from './components/MetricCard'
import { PerformanceChart, type PerformancePoint } from './components/PerformanceChart'
import { Sidebar, type AppView } from './components/Sidebar'
import './App.css'

interface ApiAthlete {
  id: string
  firstName: string
  lastName: string
  sport: string
  group: string
  position?: string
  latestAssessment: {
    overallScore: number
    metrics: { name: string }[]
  } | null
}

interface DashboardSummary {
  period: string
  totalAthletes: number
  activeAthletes: number
  averagePerformance: number | null
  completedSessions: number
  plannedSessions: number
}

interface ApiUpcomingSession {
  _id: string
  title: string
  scheduledAt: string
  durationMinutes: number
  athletes: { firstName: string; lastName: string; group: string }[]
}

const athleteTones: Athlete['tone'][] = ['mint', 'peach', 'lilac', 'yellow']

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
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loadingAthletes, setLoadingAthletes] = useState(true)
  const [athleteError, setAthleteError] = useState('')
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null)
  const [performanceTrend, setPerformanceTrend] = useState<PerformancePoint[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<ApiUpcomingSession[]>([])
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const copy = viewCopy[activeView]

  useEffect(() => {
    const controller = new AbortController()

    async function loadAthletes() {
      try {
        const response = await fetch('/api/athletes', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed (${response.status}).`)
        }
        const records = await response.json() as ApiAthlete[]
        setAthletes(records.map((record, index) => {
          const initials = `${record.firstName.charAt(0)}${record.lastName.charAt(0)}`.toUpperCase()
          return {
            id: record.id,
            name: `${record.firstName} ${record.lastName}`,
            initials,
            group: `${record.group} · ${record.position ?? record.sport}`,
            score: record.latestAssessment?.overallScore ?? 0,
            change: '—',
            focus: record.latestAssessment?.metrics[0]?.name ?? 'Assessment needed',
            tone: athleteTones[index % athleteTones.length],
          }
        }))
        setAthleteError('')
      } catch (error) {
        if (!controller.signal.aborted) {
          setAthleteError(error instanceof Error ? error.message : 'Unknown error.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAthletes(false)
        }
      }
    }

    void loadAthletes()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const periodKey = period === 'This week' ? 'week' : period === 'This quarter' ? 'quarter' : 'month'

    async function loadDashboard() {
      try {
        const [summaryResponse, trendResponse, sessionsResponse] = await Promise.all([
          fetch(`/api/dashboard/summary?period=${periodKey}`, { signal: controller.signal }),
          fetch('/api/dashboard/performance-trend', { signal: controller.signal }),
          fetch('/api/dashboard/upcoming-sessions', { signal: controller.signal }),
        ])
        const failedResponse = [summaryResponse, trendResponse, sessionsResponse].find((response) => !response.ok)
        if (failedResponse) {
          throw new Error(`Request failed (${failedResponse.status}).`)
        }

        const [summary, trend, sessions] = await Promise.all([
          summaryResponse.json() as Promise<DashboardSummary>,
          trendResponse.json() as Promise<PerformancePoint[]>,
          sessionsResponse.json() as Promise<ApiUpcomingSession[]>,
        ])
        setDashboardSummary(summary)
        setPerformanceTrend(trend)
        setUpcomingSessions(sessions)
        setDashboardError('')
      } catch (error) {
        if (!controller.signal.aborted) {
          setDashboardError(error instanceof Error ? error.message : 'Unknown error.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDashboard(false)
        }
      }
    }

    void loadDashboard()
    return () => controller.abort()
  }, [period])

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

          {loadingAthletes && <p role="status">Loading athlete data…</p>}
          {athleteError && <p className="api-error" role="alert">Unable to load athletes: {athleteError}</p>}
          {loadingDashboard && <p role="status">Loading dashboard data…</p>}
          {dashboardError && <p className="api-error" role="alert">Unable to load dashboard data: {dashboardError}</p>}
          {activeView === 'overview' && <Overview period={period} athletes={athletes} summary={dashboardSummary} trend={performanceTrend} sessions={upcomingSessions} onAthleteSelect={openAthlete} onPlan={() => { setActiveView('training'); showToast('Training view opened.') }} />}
          {activeView === 'athletes' && <AthleteView athletes={athletes} selectedAthlete={selectedAthlete} onAthleteSelect={openAthlete} />}
          {activeView === 'training' && <TrainingView onCreate={() => showToast('A new session draft is ready.')} />}
          {activeView === 'insights' && <InsightsView athletes={athletes} trend={performanceTrend} onAthleteSelect={openAthlete} />}
        </div>
      </main>
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  )
}

function Overview({ period, athletes, summary, trend, sessions, onAthleteSelect, onPlan }: { period: string; athletes: Athlete[]; summary: DashboardSummary | null; trend: PerformancePoint[]; sessions: ApiUpcomingSession[]; onAthleteSelect: (athlete: Athlete) => void; onPlan: () => void }) {
  return (
    <>
      <section className="metric-grid" aria-label="Squad summary">
        <MetricCard label="Active athletes" value={`${summary?.activeAthletes ?? '—'}`} note={`${summary?.totalAthletes ?? '—'} total athletes`} icon={<Users size={17} />} />
        <MetricCard label={`Average performance · ${period.toLowerCase()}`} value={summary?.averagePerformance === null || summary?.averagePerformance === undefined ? '—' : `${Math.round(summary.averagePerformance)}`} suffix="/100" note="Latest assessment per athlete" icon={<Activity size={17} />} trend="positive" />
        <MetricCard label="Sessions completed" value={`${summary?.completedSessions ?? '—'}`} note="Sessions recorded in the database" icon={<ClipboardList size={17} />} />
        <MetricCard label="Sessions planned" value={`${summary?.plannedSessions ?? '—'}`} note="Scheduled training sessions" icon={<ArrowDownRight size={17} />} trend="caution" />
      </section>

      <section className="overview-grid">
        <PerformanceChart points={trend} />
        {athletes[0]
          ? <CoachInsight athlete={athletes[0]} onAction={onPlan} />
          : <div className="insight-panel"><h2>No athletes in the database yet</h2><p>Add an athlete and assessment through the API to see coaching insights here.</p></div>}
      </section>

      <section className="lower-grid">
        <div className="panel roster-panel">
          <div className="panel-heading">
            <div><h2>Athletes to watch</h2><p>Recent progress and coaching focus</p></div>
            <button className="text-button" type="button" onClick={() => athletes[0] && onAthleteSelect(athletes[0])}>View roster <ChevronRight size={15} /></button>
          </div>
          <AthleteTable athletes={athletes.slice(0, 3)} onSelect={onAthleteSelect} />
        </div>
        <div className="panel schedule-panel">
          <div className="panel-heading"><div><h2>Upcoming sessions</h2><p>Next scheduled training sessions</p></div><button className="icon-button" type="button" aria-label="Create a session" title="Create a session" onClick={onPlan}><Plus size={17} /></button></div>
          <SessionList sessions={sessions} />
        </div>
      </section>
    </>
  )
}

function AthleteView({ athletes, selectedAthlete, onAthleteSelect }: { athletes: Athlete[]; selectedAthlete: Athlete | null; onAthleteSelect: (athlete: Athlete) => void }) {
  return (
    <section className="panel full-panel">
      <div className="panel-heading"><div><h2>Squad roster</h2><p>Select an athlete to review their current development focus.</p></div><span className="roster-count">{athletes.length} athletes</span></div>
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

function InsightsView({ athletes, trend, onAthleteSelect }: { athletes: Athlete[]; trend: PerformancePoint[]; onAthleteSelect: (athlete: Athlete) => void }) {
  return (
    <>
      <section className="metric-grid insight-metrics">
        <MetricCard label="Squad score change" value="+5.2%" note="Compared with previous month" icon={<ArrowUpRight size={17} />} trend="positive" />
        <MetricCard label="Strongest area" value="Endurance" note="Average score · 84 / 100" icon={<Activity size={17} />} />
        <MetricCard label="Coaching opportunity" value="Recovery" note="3 athletes flagged for check-in" icon={<CircleHelp size={17} />} trend="caution" />
        <MetricCard label="Assessments this month" value="38" note="Across 3 age groups" icon={<ClipboardList size={17} />} />
      </section>
      <div className="overview-grid insights-lower"><PerformanceChart points={trend} /><div className="panel focus-panel"><div className="panel-heading"><div><h2>Development opportunities</h2><p>Suggested follow-ups</p></div></div>{athletes.slice(0, 3).map((athlete) => <button className="focus-row" type="button" key={athlete.id} onClick={() => onAthleteSelect(athlete)}><span className={`athlete-avatar ${athlete.tone}`}>{athlete.initials}</span><span className="focus-name"><strong>{athlete.name}</strong><small>{athlete.focus} focus</small></span><ChevronRight size={16} /></button>)}</div></div>
    </>
  )
}

function SessionList({ sessions }: { sessions: ApiUpcomingSession[] }) {
  return <div className="session-list">{sessions.length > 0
    ? sessions.map((session) => {
      const scheduledAt = new Date(session.scheduledAt)
      const time = scheduledAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      const groups = [...new Set(session.athletes.map((athlete) => athlete.group))]
      const groupLabel = `${session.athletes.length} athletes · ${groups.join(', ')}`
      return <div className="session-row" key={session._id}><span className="session-clock">{time}</span><span className="session-type"><Activity size={15} /><span><strong>{session.title}</strong><small>{groupLabel} · {session.durationMinutes} min</small></span></span></div>
    })
    : <p className="session-empty">No upcoming sessions are scheduled.</p>}</div>
}

export default App
