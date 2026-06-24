import { useEffect, useState } from 'react'
import type { TestCase, CaseStatus, CasePriority, Comment } from './testCases'
import { COLUMNS, PROJECT } from './testCases'
import { consumeDemoResetFromUrl, resetTestTrackState } from '../lib/demoState'
import {
  CHANGE_EVENT,
  getAllEffective,
  installApi,
  loadOverrides,
} from './store'

const priorityMeta: Record<CasePriority, { color: string; glyph: string }> = {
  Highest: { color: 'text-red-600', glyph: '⇈' },
  High: { color: 'text-orange-500', glyph: '↑' },
  Medium: { color: 'text-amber-500', glyph: '=' },
  Low: { color: 'text-sky-500', glyph: '↓' },
}

const columnAccent: Record<CaseStatus, string> = {
  Backlog: 'text-slate-500',
  'To Do': 'text-indigo-600',
  'In Progress': 'text-blue-600',
  Done: 'text-emerald-600',
}

function TypeBadge({ type }: { type: TestCase['type'] }) {
  const isBug = type === 'Bug'
  return (
    <span
      title={type}
      className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] text-[10px] font-bold text-white ${
        isBug ? 'bg-red-500' : 'bg-teal-500'
      }`}
    >
      {isBug ? 'B' : 'T'}
    </span>
  )
}

function Avatar({ initials }: { initials: string }) {
  const unassigned = initials === 'Unassigned'
  const short = unassigned ? '?' : initials.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || '?'
  return (
    <span
      title={initials}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
        unassigned ? 'border border-dashed border-slate-300 text-slate-400' : 'bg-indigo-500 text-white'
      }`}
    >
      {short}
    </span>
  )
}

// Render comment text with bare URLs turned into clickable links.
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline break-all hover:text-indigo-800"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function Card({ tc, onOpen }: { tc: TestCase; onOpen: (key: string) => void }) {
  const p = priorityMeta[tc.priority]
  return (
    <button
      onClick={() => onOpen(tc.key)}
      data-testid={`case-card-${tc.key}`}
      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow"
    >
      <p className="text-sm font-medium leading-snug text-slate-800">{tc.title}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {tc.labels.map((l) => (
          <span
            key={l}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              l === 'needs-automation' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {l}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeBadge type={tc.type} />
          <span className="font-mono text-xs text-slate-500">{tc.key}</span>
          <span className={`text-sm font-bold ${p.color}`} title={`${tc.priority} priority`}>
            {p.glyph}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {tc.comments && tc.comments.length > 0 && (
            <span className="text-[10px] text-slate-400" title={`${tc.comments.length} comments`}>
              💬 {tc.comments.length}
            </span>
          )}
          {tc.automated ? (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              automated
            </span>
          ) : (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              manual
            </span>
          )}
          <Avatar initials={tc.assignee} />
        </div>
      </div>
    </button>
  )
}

function CommentItem({ c }: { c: Comment }) {
  const isAgent = /agent|devin/i.test(c.author)
  return (
    <li className="flex gap-2">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          isAgent ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
        }`}
      >
        {isAgent ? '🤖' : c.author.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 rounded-md bg-slate-50 px-3 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-slate-700">{c.author}</span>
          <span className="text-[10px] text-slate-400">{new Date(c.at).toLocaleString()}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          <Linkified text={c.body} />
        </p>
      </div>
    </li>
  )
}

function DetailDrawer({ tc, onClose }: { tc: TestCase; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-slate-900/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid={`case-detail-${tc.key}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <TypeBadge type={tc.type} />
            <span className="font-mono text-sm text-slate-500">{tc.key}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="space-y-6 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">{tc.title}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field
              label="Status"
              value={tc.status}
              badge={
                tc.status === 'Done'
                  ? 'bg-emerald-100 text-emerald-700'
                  : tc.status === 'To Do'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
              }
            />
            <Field label="Priority" value={tc.priority} />
            <Field label="Assignee" value={tc.assignee} />
            <Field label="Automation" value={tc.automated ? 'Automated' : 'Manual'} />
          </div>
          <Section title="Description">
            <p className="text-sm leading-relaxed text-slate-700">{tc.description}</p>
          </Section>
          <Section title="Steps to reproduce">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {tc.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Section>
          <Section title="Expected result">
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{tc.expected}</p>
          </Section>
          <Section title={`Activity${tc.comments?.length ? ` (${tc.comments.length})` : ''}`}>
            {tc.comments && tc.comments.length > 0 ? (
              <ul className="space-y-3" data-testid={`case-comments-${tc.key}`}>
                {tc.comments.map((c, i) => (
                  <CommentItem key={i} c={c} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No comments yet.</p>
            )}
          </Section>
        </div>
      </aside>
    </div>
  )
}

function Field({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {badge ? (
        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
          {value}
        </span>
      ) : (
        <div className="mt-0.5 font-medium text-slate-800">{value}</div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </div>
  )
}

export default function QaApp() {
  const [overrides, setOverrides] = useState(() => {
    consumeDemoResetFromUrl(resetTestTrackState)
    return loadOverrides()
  })
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Expose window.testtrack (the "Jira MCP") and stay in sync with mutations.
  useEffect(() => {
    installApi()
    const refresh = () => setOverrides(loadOverrides())
    window.addEventListener(CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Deep link: /qa.html?case=ERP-201 opens that ticket directly.
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('case')
    if (key) setSelectedKey(key.toUpperCase())
  }, [])

  const cases = getAllEffective(overrides)
  const selected = selectedKey ? cases.find((c) => c.key === selectedKey) ?? null : null
  const needAutomation = cases.filter((t) => !t.automated).length

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      {/* Left sidebar — distinct from the ERP app */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-[#1d2230] text-slate-300 sm:flex">
        <div className="flex items-center gap-2 px-4 py-4 text-white">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-indigo-500 text-sm font-black">
            T
          </span>
          <span className="font-semibold">TestTrack</span>
        </div>
        <nav className="mt-2 space-y-0.5 px-2 text-sm">
          <div className="rounded px-3 py-2 text-slate-400">Roadmap</div>
          <div className="rounded bg-white/10 px-3 py-2 font-medium text-white">Board</div>
          <div className="rounded px-3 py-2 text-slate-400">Backlog</div>
          <div className="rounded px-3 py-2 text-slate-400">Reports</div>
        </nav>
        <div className="mt-auto px-4 py-4 text-xs text-slate-500">
          Project: {PROJECT.key} · {PROJECT.name}
        </div>
      </aside>

      {/* Main board */}
      <main className="flex-1 overflow-x-auto">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="text-xs text-slate-400">Projects / {PROJECT.name} / Boards</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{PROJECT.board}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{PROJECT.blurb}</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
              Filter: Automation = Needed
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
              {needAutomation} {needAutomation === 1 ? 'case' : 'cases'} need automation
            </span>
          </div>
        </header>

        <div className="flex gap-4 p-6">
          {COLUMNS.map((col) => {
            const colCases = cases.filter((t) => t.status === col)
            return (
              <section
                key={col}
                data-testid={`column-${col.replace(/\s+/g, '-').toLowerCase()}`}
                className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-200/60 p-2"
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${columnAccent[col]}`}>
                    {col}
                  </span>
                  <span className="rounded-full bg-white px-2 text-xs font-medium text-slate-500">
                    {colCases.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colCases.map((tc) => (
                    <Card key={tc.key} tc={tc} onOpen={setSelectedKey} />
                  ))}
                  {colCases.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
                      No cases
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      {selected && <DetailDrawer tc={selected} onClose={() => setSelectedKey(null)} />}
    </div>
  )
}
