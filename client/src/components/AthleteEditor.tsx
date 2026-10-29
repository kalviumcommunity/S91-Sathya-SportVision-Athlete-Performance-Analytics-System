import { useState, type FormEvent } from 'react'
import type { Athlete } from './AthleteTable'

export type AthleteUpdate = {
  firstName: string
  lastName: string
  sport: string
  group: string
  position: string
  dateOfBirth: string | null
  status: 'active' | 'inactive'
}

interface AthleteEditorProps {
  athlete: Athlete
  saving: boolean
  error: string
  onSave: (fields: AthleteUpdate) => void
  onCancel: () => void
}

export function AthleteEditor({ athlete, saving, error, onSave, onCancel }: AthleteEditorProps) {
  const [firstName, setFirstName] = useState(athlete.details.firstName)
  const [lastName, setLastName] = useState(athlete.details.lastName)
  const [sport, setSport] = useState(athlete.details.sport)
  const [group, setGroup] = useState(athlete.details.group)
  const [position, setPosition] = useState(athlete.details.position ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(athlete.details.dateOfBirth?.slice(0, 10) ?? '')
  const [status, setStatus] = useState<AthleteUpdate['status']>(athlete.details.status)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ firstName, lastName, sport, group, position, dateOfBirth: dateOfBirth || null, status })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onCancel()
    }} onKeyDown={(event) => {
      if (event.key === 'Escape' && !saving) onCancel()
    }}>
      <section className="athlete-editor" role="dialog" aria-modal="true" aria-labelledby="athlete-editor-title">
        <h2 id="athlete-editor-title">Edit athlete</h2>
        <p>Update {athlete.name}’s profile details.</p>
        <form className="athlete-editor-form" onSubmit={submit}>
          <label>First name<input autoFocus required maxLength={80} value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
          <label>Last name<input required maxLength={80} value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
          <label>Sport<input required maxLength={80} value={sport} onChange={(event) => setSport(event.target.value)} /></label>
          <label>Squad/group<input required maxLength={80} value={group} onChange={(event) => setGroup(event.target.value)} /></label>
          <label>Position<input maxLength={80} value={position} onChange={(event) => setPosition(event.target.value)} /></label>
          <label>Date of birth<input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as AthleteUpdate['status'])}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          {error && <p className="api-error" role="alert">{error}</p>}
          <div className="athlete-editor-actions">
            <button className="secondary-button" type="button" disabled={saving} onClick={onCancel}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
