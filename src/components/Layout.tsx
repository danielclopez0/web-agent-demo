import type { ReactNode } from 'react'
import type { User } from '../types'

type Props = {
  user: User
  currentPage: 'orders' | 'new-order'
  onNavigate: (page: 'orders' | 'new-order') => void
  onSignOut: () => void
  children: ReactNode
}

export function Layout({ user, currentPage, onNavigate, onSignOut, children }: Props) {
  const navLink = (page: 'orders' | 'new-order', label: string) => (
    <button
      onClick={() => onNavigate(page)}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        currentPage === page
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-semibold text-slate-900">DemoCorp ERP</div>
            <div className="flex gap-1">
              {navLink('orders', 'Orders')}
              {navLink('new-order', 'New Order')}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/qa.html"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="testtrack-link"
              className="text-slate-500 hover:text-slate-900"
            >
              Test Cases ↗
            </a>
            <div className="text-right">
              <div className="font-medium text-slate-900">{user.name}</div>
              <div className="text-slate-500 text-xs">{user.role}</div>
            </div>
            <button onClick={onSignOut} className="text-slate-600 hover:text-slate-900 underline">
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
