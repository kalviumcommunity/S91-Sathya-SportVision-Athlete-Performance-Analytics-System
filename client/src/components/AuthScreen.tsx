import { useState, type FormEvent } from 'react'

interface AuthScreenProps {
  busy: boolean
  error: string
  onAuthenticate: (mode: 'login' | 'signup', username: string, password: string) => Promise<void>
}

export function AuthScreen({ busy, error, onAuthenticate }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onAuthenticate(mode, username, password)
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="brand auth-brand" href="#login">
          <span className="brand-mark">S</span><span>SportVision</span>
        </a>
        <p className="eyebrow">Academy workspace</p>
        <h1 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your coach account'}</h1>
        <p className="auth-description">{mode === 'login' ? 'Sign in to continue to your team dashboard.' : 'Create an account to manage your athlete workspace.'}</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-username">Username</label>
          <input
            id="auth-username"
            autoComplete="username"
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9._-]{3,32}"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            maxLength={72}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="api-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? 'New to SportVision?' : 'Already have an account?'}
          {' '}
          <button type="button" disabled={busy} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  )
}
