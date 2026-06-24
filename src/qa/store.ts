// Runtime mutation layer for the TestTrack board.
//
// The board's seed lives in testCases.ts (static). This module overlays
// per-ticket changes — status transitions and appended comments — persisted
// to localStorage so they survive navigation/reload within the demo.
//
// It also exposes `window.testtrack`, which is the surface an agent drives to
// "update a ticket." In a real setup this would be a Jira MCP server; here it's
// a thin shim over local mock data so the demo can show a ticket actually change.

import type { CaseStatus, Comment, TestCase } from './testCases'
import { TEST_CASES } from './testCases'

export type Override = {
  status?: CaseStatus
  automated?: boolean
  comments?: Comment[]
}
export type Overrides = Record<string, Override>

const KEY = 'testtrack:overrides:v1'
export const CHANGE_EVENT = 'testtrack:change'

export function loadOverrides(): Overrides {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Overrides) : {}
  } catch {
    return {}
  }
}

function save(o: Overrides) {
  localStorage.setItem(KEY, JSON.stringify(o))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function ensure(o: Overrides, key: string): Override {
  if (!o[key]) o[key] = {}
  return o[key]
}

function mergeOne(base: TestCase, ov?: Override): TestCase {
  if (!ov) return base
  return {
    ...base,
    status: ov.status ?? base.status,
    automated: ov.automated ?? base.automated,
    comments: [...(base.comments ?? []), ...(ov.comments ?? [])],
  }
}

export function getAllEffective(overrides: Overrides): TestCase[] {
  return TEST_CASES.map((t) => mergeOne(t, overrides[t.key]))
}

export function getEffective(key: string): TestCase | undefined {
  const base = TEST_CASES.find((t) => t.key === key)
  if (!base) return undefined
  return mergeOne(base, loadOverrides()[key])
}

// ---- Mutations (what window.testtrack exposes) ----

export function setStatus(key: string, status: CaseStatus): TestCase | undefined {
  const o = loadOverrides()
  ensure(o, key).status = status
  save(o)
  return getEffective(key)
}

export function addComment(
  key: string,
  comment: { author?: string; body: string },
): TestCase | undefined {
  const o = loadOverrides()
  const ov = ensure(o, key)
  ov.comments = [
    ...(ov.comments ?? []),
    { author: comment.author ?? 'Devin (agent)', body: comment.body, at: new Date().toISOString() },
  ]
  save(o)
  return getEffective(key)
}

// The headline action: mark a story done (and, since we just wrote a test,
// flip it to automated) plus optionally drop a comment with a PR link.
export function complete(
  key: string,
  opts: { comment?: string; author?: string } = {},
): TestCase | undefined {
  const o = loadOverrides()
  const ov = ensure(o, key)
  ov.status = 'Done'
  ov.automated = true
  if (opts.comment) {
    ov.comments = [
      ...(ov.comments ?? []),
      { author: opts.author ?? 'Devin (agent)', body: opts.comment, at: new Date().toISOString() },
    ]
  }
  save(o)
  return getEffective(key)
}

export function reset() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// Install the agent-facing API. Called once on app mount.
export function installApi() {
  ;(window as unknown as { testtrack: unknown }).testtrack = {
    complete,
    setStatus,
    addComment,
    reset,
    get: getEffective,
    list: () => getAllEffective(loadOverrides()),
  }
}
