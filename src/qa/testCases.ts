// Seed data for the TestTrack QA board — a mock test-management tool.
// These are the test cases for the DemoCorp ERP project. The "To Do" column
// holds cases that have NO automated coverage yet — those are the ones the
// agent validates live in the browser, then writes a durable Playwright test for.

export type CaseStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Done'
export type CasePriority = 'Highest' | 'High' | 'Medium' | 'Low'
export type CaseType = 'Test' | 'Bug'

export type Comment = {
  author: string
  body: string
  at: string // ISO timestamp
}

export type TestCase = {
  key: string
  title: string
  description: string
  steps: string[]
  expected: string
  type: CaseType
  priority: CasePriority
  status: CaseStatus
  labels: string[]
  assignee: string
  // Whether a durable automated test already exists for this case.
  automated: boolean
  comments?: Comment[]
}

export const PROJECT = {
  key: 'ERP',
  name: 'DemoCorp ERP',
  board: 'Test Automation Backlog',
  // The framing shown to viewers: what this board is for.
  blurb: 'Backlog of manual test cases we need to validate and convert into automated Playwright coverage.',
}

export const COLUMNS: CaseStatus[] = ['Backlog', 'To Do', 'In Progress', 'Done']

export const TEST_CASES: TestCase[] = [
  // ---- Done: already have automated coverage (tests/smoke.spec.ts) ----
  {
    key: 'ERP-101',
    title: 'Sign in with valid corporate credentials',
    description: 'A procurement manager can authenticate into DemoCorp ERP with valid credentials and land on the Orders page.',
    steps: [
      'Navigate to the DemoCorp ERP login page',
      'Enter a valid corporate email and password',
      'Click Sign In',
    ],
    expected: 'The Purchase Orders page loads with the seeded orders visible.',
    type: 'Test',
    priority: 'Highest',
    status: 'Done',
    labels: ['auth', 'smoke'],
    assignee: 'JS',
    automated: true,
  },
  {
    key: 'ERP-102',
    title: 'Filter purchase orders by status',
    description: 'The Orders list can be narrowed to a single status using the filter pills.',
    steps: [
      'Sign in and open the Orders page',
      'Click the "Approved" filter pill',
    ],
    expected: 'Only Approved orders remain in the table; other statuses are hidden.',
    type: 'Test',
    priority: 'High',
    status: 'Done',
    labels: ['orders', 'smoke'],
    assignee: 'JS',
    automated: true,
  },
  {
    key: 'ERP-103',
    title: 'Export filtered orders to CSV',
    description: 'Exporting writes a CSV that reflects the current filter.',
    steps: [
      'Filter to Approved orders',
      'Click Export CSV',
    ],
    expected: 'A CSV file named orders-*.csv downloads containing the filtered rows.',
    type: 'Test',
    priority: 'High',
    status: 'Done',
    labels: ['orders', 'export'],
    assignee: 'JS',
    automated: true,
  },
  {
    key: 'ERP-104',
    title: 'Create a new purchase order',
    description: 'A new PO can be submitted via the New Order form and appears at the top of the list.',
    steps: [
      'Open New Order',
      'Fill vendor, description, amount, cost center',
      'Click Submit Order',
    ],
    expected: 'A success card confirms the new PO with status Submitted.',
    type: 'Test',
    priority: 'Medium',
    status: 'Done',
    labels: ['orders', 'forms'],
    assignee: 'JS',
    automated: true,
  },

  // ---- To Do: NO automated coverage yet — the live-demo candidates ----
  {
    key: 'ERP-201',
    title: 'Search orders by vendor, PO number, or description',
    description: 'The Orders page has a search box that narrows the table by free-text match across PO #, vendor, and description. Search composes with the status filter.',
    steps: [
      'Sign in and open the Orders page',
      'Type "Vertex" into the search box',
      'Observe the table',
      'Clear the search and type a PO number fragment (e.g. "003")',
    ],
    expected: 'Typing "Vertex" shows only Vertex Technologies orders; typing "003" shows only PO-2026-003. Clearing the box restores all rows.',
    type: 'Test',
    priority: 'High',
    status: 'To Do',
    labels: ['orders', 'search', 'needs-automation'],
    assignee: 'Unassigned',
    automated: false,
    comments: [
      {
        author: 'Priya N. (QA Lead)',
        body: 'Flagged for the automation sprint — zero coverage on search today. Please validate manually then add a Playwright test.',
        at: '2026-06-15T16:20:00Z',
      },
    ],
  },
  {
    key: 'ERP-202',
    title: 'Approve a submitted order updates its status',
    description: 'Each non-Approved order row has an Approve action. Clicking it transitions the order to Approved and the status badge updates in place.',
    steps: [
      'Sign in and open the Orders page',
      'Find a Submitted order (e.g. PO-2026-003)',
      'Click its Approve button',
    ],
    expected: 'The order\u2019s status badge changes to Approved and the Approve button for that row disappears.',
    type: 'Test',
    priority: 'High',
    status: 'To Do',
    labels: ['orders', 'workflow', 'needs-automation'],
    assignee: 'Unassigned',
    automated: false,
    comments: [
      {
        author: 'Priya N. (QA Lead)',
        body: 'Blocks the release checklist until automated — the approve transition is high-risk.',
        at: '2026-06-15T16:22:00Z',
      },
    ],
  },

  // ---- Backlog: lower priority, not yet scheduled ----
  {
    key: 'ERP-203',
    title: 'Invalid credentials show an error message',
    description: 'Signing in with the wrong password surfaces an inline error and keeps the user on the login page.',
    steps: [
      'Open the login page',
      'Enter a valid email with a wrong password',
      'Click Sign In',
    ],
    expected: 'An "Invalid credentials" alert appears; the user stays on the login form.',
    type: 'Test',
    priority: 'Medium',
    status: 'Backlog',
    labels: ['auth', 'negative'],
    assignee: 'Unassigned',
    automated: false,
  },
  {
    key: 'ERP-204',
    title: 'New order requires a description',
    description: 'Submitting the New Order form without a description shows a validation error and does not create an order.',
    steps: [
      'Open New Order',
      'Leave Description empty, set an amount',
      'Click Submit Order',
    ],
    expected: 'A validation error is shown and no success card appears.',
    type: 'Test',
    priority: 'Low',
    status: 'Backlog',
    labels: ['forms', 'validation', 'negative'],
    assignee: 'Unassigned',
    automated: false,
  },
]
