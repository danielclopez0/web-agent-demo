import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEMO_USER } from '../data/seed'
import type { User } from '../types'
import { Button } from '../components/Button'

type Props = {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState(DEMO_USER.email)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email === DEMO_USER.email && password.trim()) {
      setError(null)
      onLogin(DEMO_USER)
    } else if (email !== DEMO_USER.email) {
      setError('Use the DemoCorp service user email for this sandbox.')
    } else {
      setError('Enter any password to continue the demo.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-md p-8 space-y-5"
        data-testid="login-form"
      >
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">DemoCorp ERP</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your corporate credentials</p>
          <p className="text-xs text-slate-400 mt-2">Demo sandbox: service user is prefilled; any password works.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Corporate Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && (
          <div className="text-sm text-red-600" role="alert" data-testid="login-error">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" data-testid="sign-in-btn">
          Sign In
        </Button>
      </form>
    </div>
  )
}
