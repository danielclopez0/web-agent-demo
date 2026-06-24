# Web Agent Demo Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the web-agent-demo repo from scratch as a lightweight 3-page sandbox + skills suite that demos AI agents operating browser-only enterprise software, with a browser → CSV → local HTML report loop as the distinguishing wow moment.

**Architecture:** Vite 7 + React 19 + TypeScript + Tailwind v3.4, all on Node 22 LTS. Three pages (Login → Orders → New Order), client-side state via `useState`, no router (plain page-switch state), CSV export via in-browser Blob, one Playwright smoke test. The agent-facing skills in `.devin/skills/` and `AGENTS.md` are the actual deliverable; the React app is sandbox scaffolding.

**Tech Stack:** Node 22 LTS, Vite 7.x, React 19, TypeScript 5.x, Tailwind CSS 3.4, Playwright (smoke test only).

**Source spec:** `docs/superpowers/specs/2026-05-18-web-agent-demo-rebuild-design.md`

---

## Phase 0 — Demolition + foundation

### Task 0.1: Wipe the old prototype source (keep config + public)

**Files:**
- Delete: `src/`, `tests/`, `mock-jira-mcp/`, `playwright.config.ts`, `eslint.config.js`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.json`, `package.json`, `package-lock.json`, `node_modules/`, `dist/`, `index.html`, `public/icons.svg`, `AGENTS.md`, `README.md`, `.devin/skills/`
- Keep: `.devin/config.local.json` (gitignored), `public/favicon.svg`, `docs/`, `.gitignore`, `.git/`

- [ ] **Step 1: Verify the design spec is committed before wiping**

```bash
git log --oneline
```

Expected: at least one commit visible, the design-spec commit `a9b60b5`.

- [ ] **Step 2: Delete prototype files**

```bash
rm -rf src tests mock-jira-mcp node_modules dist
rm -f playwright.config.ts eslint.config.js vite.config.ts \
      tsconfig.app.json tsconfig.node.json tsconfig.json \
      package.json package-lock.json index.html \
      AGENTS.md README.md public/icons.svg
rm -rf .devin/skills
```

- [ ] **Step 3: Verify the wipe**

```bash
ls -A
```

Expected output (order may vary): `.devin .git .gitignore docs public`

- [ ] **Step 4: Commit the demolition**

```bash
git add -A
git commit -m "chore: demolish prototype, keep design spec + public assets"
```

---

### Task 0.2: Pin Node 22 + scaffold package.json

**Files:**
- Create: `.nvmrc`, `package.json`

- [ ] **Step 1: Write `.nvmrc`**

```
22
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "web-agent-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": "^22.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:headed": "playwright test --headed"
  },
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "@types/node": "^22.0.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.0",
    "vite": "^7.0.0"
  }
}
```

- [ ] **Step 3: Activate Node 22 + install**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node --version  # must show v22.x
npm install
```

Expected: install completes with zero EBADENGINE warnings.

- [ ] **Step 4: Commit**

```bash
git add .nvmrc package.json package-lock.json
git commit -m "build: pin Node 22 LTS, scaffold package.json with stable deps"
```

---

### Task 0.3: Scaffold Vite + TypeScript + Tailwind v3.4 config

**Files:**
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`

- [ ] **Step 1: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
```

- [ ] **Step 2: Write `tsconfig.json` (project references)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 3: Write `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Write `tailwind.config.js` (explicit `content` — no module-graph magic)**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 6: Write `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DemoCorp ERP</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Commit**

```bash
git add vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json \
        tailwind.config.js postcss.config.js index.html
git commit -m "build: scaffold Vite 7 + Tailwind v3.4 toolchain"
```

---

### Task 0.4: Scaffold `src/main.tsx` + `src/index.css` + placeholder `App.tsx`, verify Tailwind works

**Files:**
- Create: `src/main.tsx`, `src/index.css`, `src/App.tsx`

- [ ] **Step 1: Write `src/index.css` (Tailwind v3 directives)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: Write `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Write placeholder `src/App.tsx` (intentionally styled to verify Tailwind)**

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">DemoCorp ERP</h1>
        <p className="mt-2 text-slate-600">Tailwind v3 smoke check.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify the build produces utility CSS**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
rm -rf dist
npm run build
CSS=$(ls dist/assets/index-*.css)
for cls in bg-white rounded-lg shadow-md text-slate-600 min-h-screen; do
  count=$(grep -oE "\\.${cls}[^a-zA-Z0-9-]" $CSS 2>/dev/null | wc -l | tr -d ' ')
  echo "  .$cls -> $count"
done
```

Expected: every class shows `-> 1` (or more). This is the regression test for the Tailwind issue that started this rebuild.

- [ ] **Step 5: Manual visual check via dev server**

```bash
npm run dev &
sleep 2
open http://localhost:5173/
# Expected: centered white card on slate background, "DemoCorp ERP" heading.
# Press Ctrl+C when done.
lsof -ti:5173 | xargs kill
```

- [ ] **Step 6: Commit**

```bash
git add src/main.tsx src/index.css src/App.tsx
git commit -m "feat: smoke-test the Tailwind v3 toolchain with a placeholder App"
```

---

## Phase 1 — App pages

### Task 1.1: Domain types + seed data

**Files:**
- Create: `src/types.ts`, `src/data/seed.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
export type User = {
  email: string
  name: string
  role: string
}

export type Order = {
  id: string
  vendor: string
  description: string
  amount: number
  status: 'Draft' | 'Submitted' | 'Approved'
  createdAt: string  // ISO date
  costCenter: string
}

export type Vendor = {
  id: string
  name: string
}

export type CostCenter = {
  id: string
  name: string
}
```

- [ ] **Step 2: Write `src/data/seed.ts` (enough rows for the CSV report to be interesting)**

```ts
import type { Order, Vendor, CostCenter, User } from '../types'

export const DEMO_USER: User = {
  email: 'john.smith@democorp.example',
  name: 'John Smith',
  role: 'Procurement Manager',
}

export const DEMO_PASSWORD = 'Acme2024!'

export const VENDORS: Vendor[] = [
  { id: 'V-001', name: 'Vertex Technologies' },
  { id: 'V-002', name: 'Global Office Supplies' },
  { id: 'V-003', name: 'CloudNet Infrastructure' },
  { id: 'V-004', name: 'Pinnacle Consulting Group' },
  { id: 'V-005', name: 'Northwind Industrial' },
]

export const COST_CENTERS: CostCenter[] = [
  { id: 'CC-1001', name: 'Engineering' },
  { id: 'CC-1002', name: 'Marketing' },
  { id: 'CC-1003', name: 'Operations' },
  { id: 'CC-1004', name: 'IT Infrastructure' },
  { id: 'CC-1005', name: 'Finance' },
]

export const SEED_ORDERS: Order[] = [
  { id: 'PO-2026-001', vendor: 'Vertex Technologies',     description: '4x Dell PowerEdge servers',    amount: 26000, status: 'Approved',  createdAt: '2026-04-12', costCenter: 'CC-1004' },
  { id: 'PO-2026-002', vendor: 'Global Office Supplies',  description: 'Q2 office consumables',         amount:  3450, status: 'Approved',  createdAt: '2026-04-15', costCenter: 'CC-1003' },
  { id: 'PO-2026-003', vendor: 'CloudNet Infrastructure', description: '12-month CDN contract',         amount: 48000, status: 'Submitted', createdAt: '2026-04-22', costCenter: 'CC-1004' },
  { id: 'PO-2026-004', vendor: 'Pinnacle Consulting Group', description: 'Salesforce migration assist', amount: 92500, status: 'Submitted', createdAt: '2026-05-02', costCenter: 'CC-1001' },
  { id: 'PO-2026-005', vendor: 'Vertex Technologies',     description: 'Network switches (2x)',         amount:  6400, status: 'Draft',     createdAt: '2026-05-08', costCenter: 'CC-1004' },
  { id: 'PO-2026-006', vendor: 'Northwind Industrial',    description: 'Lab equipment refresh',         amount: 18750, status: 'Approved',  createdAt: '2026-05-10', costCenter: 'CC-1001' },
  { id: 'PO-2026-007', vendor: 'Global Office Supplies',  description: 'Standing desks (8)',            amount:  4800, status: 'Submitted', createdAt: '2026-05-12', costCenter: 'CC-1002' },
  { id: 'PO-2026-008', vendor: 'CloudNet Infrastructure', description: 'WAF subscription upgrade',      amount: 14200, status: 'Approved',  createdAt: '2026-05-14', costCenter: 'CC-1005' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/data/seed.ts
git commit -m "feat: domain types + seed orders for the demo"
```

---

### Task 1.2: CSV export utility

**Files:**
- Create: `src/lib/csv.ts`

- [ ] **Step 1: Write `src/lib/csv.ts`**

```ts
import type { Order } from '../types'

export function ordersToCsv(orders: Order[]): string {
  const header = ['id', 'vendor', 'description', 'amount', 'status', 'createdAt', 'costCenter']
  const escape = (v: string | number): string => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = orders.map(o => [o.id, o.vendor, o.description, o.amount, o.status, o.createdAt, o.costCenter].map(escape).join(','))
  return [header.join(','), ...rows].join('\n') + '\n'
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/csv.ts
git commit -m "feat: client-side CSV export utility (Blob download)"
```

---

### Task 1.3: Button primitive + Layout shell

**Files:**
- Create: `src/components/Button.tsx`, `src/components/Layout.tsx`

- [ ] **Step 1: Write `src/components/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300',
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
```

- [ ] **Step 2: Write `src/components/Layout.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Button.tsx src/components/Layout.tsx
git commit -m "feat: Button primitive + Layout shell with top nav"
```

---

### Task 1.4: Login page

**Files:**
- Create: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Write `src/pages/LoginPage.tsx`**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEMO_USER, DEMO_PASSWORD } from '../data/seed'
import type { User } from '../types'
import { Button } from '../components/Button'

type Props = {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
      setError(null)
      onLogin(DEMO_USER)
    } else {
      setError('Invalid credentials. Please check your email and password.')
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: LoginPage with hardcoded demo credentials"
```

---

### Task 1.5: Orders page (list + filter + CSV export)

**Files:**
- Create: `src/pages/OrdersPage.tsx`

- [ ] **Step 1: Write `src/pages/OrdersPage.tsx`**

```tsx
import { useMemo, useState } from 'react'
import type { Order } from '../types'
import { Button } from '../components/Button'
import { ordersToCsv, downloadCsv } from '../lib/csv'

type Props = {
  orders: Order[]
}

const STATUSES: Array<Order['status'] | 'All'> = ['All', 'Draft', 'Submitted', 'Approved']

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function OrdersPage({ orders }: Props) {
  const [filter, setFilter] = useState<Order['status'] | 'All'>('All')

  const filtered = useMemo(
    () => (filter === 'All' ? orders : orders.filter(o => o.status === filter)),
    [orders, filter],
  )

  const handleExport = () => {
    const csv = ordersToCsv(filtered)
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    downloadCsv(`orders-${ts}.csv`, csv)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Purchase Orders</h1>
        <Button onClick={handleExport} data-testid="export-csv-btn">
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">PO #</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{o.id}</td>
                <td className="px-4 py-3 text-slate-900">{o.vendor}</td>
                <td className="px-4 py-3 text-slate-700">{o.description}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatMoney(o.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    o.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    o.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">No orders match this filter.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/OrdersPage.tsx
git commit -m "feat: OrdersPage with status filter + CSV export"
```

---

### Task 1.6: New Order form page

**Files:**
- Create: `src/pages/NewOrderPage.tsx`

- [ ] **Step 1: Write `src/pages/NewOrderPage.tsx`**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Order } from '../types'
import { VENDORS, COST_CENTERS } from '../data/seed'
import { Button } from '../components/Button'

type Props = {
  onCreate: (order: Order) => void
  onCancel: () => void
}

export function NewOrderPage({ onCreate, onCancel }: Props) {
  const [vendor, setVendor] = useState(VENDORS[0].name)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [costCenter, setCostCenter] = useState(COST_CENTERS[0].id)
  const [submitted, setSubmitted] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const amountNum = Number(amount)
    if (!description.trim()) return setError('Description is required.')
    if (!Number.isFinite(amountNum) || amountNum <= 0) return setError('Amount must be a positive number.')
    const order: Order = {
      id: `PO-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      vendor,
      description: description.trim(),
      amount: amountNum,
      status: 'Submitted',
      createdAt: new Date().toISOString().slice(0, 10),
      costCenter,
    }
    setSubmitted(order)
    setError(null)
    onCreate(order)
  }

  if (submitted) {
    return (
      <div className="max-w-xl space-y-4" data-testid="new-order-success">
        <h1 className="text-2xl font-semibold text-slate-900">Order Submitted</h1>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-2 text-sm">
          <div><span className="text-slate-500">PO #:</span> <span className="font-mono">{submitted.id}</span></div>
          <div><span className="text-slate-500">Vendor:</span> {submitted.vendor}</div>
          <div><span className="text-slate-500">Description:</span> {submitted.description}</div>
          <div><span className="text-slate-500">Amount:</span> ${submitted.amount.toLocaleString()}</div>
          <div><span className="text-slate-500">Cost Center:</span> {submitted.costCenter}</div>
          <div><span className="text-slate-500">Status:</span> {submitted.status}</div>
        </div>
        <Button variant="secondary" onClick={onCancel}>Back to Orders</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5" data-testid="new-order-form">
      <h1 className="text-2xl font-semibold text-slate-900">New Purchase Order</h1>

      <div className="space-y-2">
        <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
        <select
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
        >
          {VENDORS.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          placeholder="e.g. 4x Dell PowerEdge servers"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount (USD)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cost-center" className="block text-sm font-medium text-slate-700">Cost Center</label>
        <select
          id="cost-center"
          value={costCenter}
          onChange={(e) => setCostCenter(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
        >
          {COST_CENTERS.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
        </select>
      </div>

      {error && <div className="text-sm text-red-600" role="alert" data-testid="form-error">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" data-testid="submit-order-btn">Submit Order</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/NewOrderPage.tsx
git commit -m "feat: NewOrderPage with vendor/cost-center selectors + validation"
```

---

### Task 1.7: Wire it all together in App.tsx

**Files:**
- Modify: `src/App.tsx` (replace placeholder)

- [ ] **Step 1: Rewrite `src/App.tsx`**

```tsx
import { useState } from 'react'
import type { User, Order } from './types'
import { SEED_ORDERS } from './data/seed'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { Layout } from './components/Layout'

type Page = 'orders' | 'new-order'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState<Page>('orders')
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS)

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <Layout
      user={user}
      currentPage={page}
      onNavigate={setPage}
      onSignOut={() => setUser(null)}
    >
      {page === 'orders' && <OrdersPage orders={orders} />}
      {page === 'new-order' && (
        <NewOrderPage
          onCreate={(order) => setOrders([order, ...orders])}
          onCancel={() => setPage('orders')}
        />
      )}
    </Layout>
  )
}
```

- [ ] **Step 2: Verify build still passes**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
rm -rf dist
npm run build
```

Expected: build succeeds, `dist/assets/index-*.css` is at least ~10 kB.

- [ ] **Step 3: Manual visual check**

```bash
npm run dev &
sleep 2
open http://localhost:5173/
# Verify: login screen → enter john.smith@democorp.example / Acme2024! →
# Orders page with 8 rows visible → filter buttons work → Export CSV downloads a file →
# nav to "New Order" → submit a row → returns success card → "Back to Orders" shows new row at top.
lsof -ti:5173 | xargs kill
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire pages into App with page-state routing"
```

---

## Phase 2 — Smoke test

### Task 2.1: One Playwright smoke test (TDD-shaped)

**Files:**
- Create: `playwright.config.ts`, `tests/smoke.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npx playwright install chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
```

- [ ] **Step 3: Write `tests/smoke.spec.ts` (this is THE one test — covers login + filter + export + new-order)**

```ts
import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'

test('login → filter orders → export CSV → submit new order', async ({ page }) => {
  // Login
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('john.smith@democorp.example')
  await page.getByLabel('Password').fill('Acme2024!')
  await page.getByTestId('sign-in-btn').click()

  // Orders page loads with seed data
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
  await expect(page.getByText('PO-2026-001')).toBeVisible()

  // Filter works
  await page.getByRole('button', { name: 'Approved', exact: true }).click()
  await expect(page.getByText('PO-2026-001')).toBeVisible()
  await expect(page.getByText('PO-2026-003')).not.toBeVisible()

  // CSV export downloads a file
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('export-csv-btn').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^orders-.+\.csv$/)
  // Save to a known path so we can assert content
  const path = `/tmp/web-agent-demo-test-${Date.now()}.csv`
  await download.saveAs(path)
  expect(existsSync(path)).toBe(true)

  // New order submission
  await page.getByRole('button', { name: 'New Order' }).click()
  await page.getByLabel('Description').fill('Test ergonomic chairs')
  await page.getByLabel('Amount (USD)').fill('1234')
  await page.getByTestId('submit-order-btn').click()
  await expect(page.getByTestId('new-order-success')).toBeVisible()
  await expect(page.getByText('Test ergonomic chairs')).toBeVisible()
})
```

- [ ] **Step 4: Run the test**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm test
```

Expected: 1 passed in <30s.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/smoke.spec.ts
git commit -m "test: one Playwright smoke test covering login + filter + export + new order"
```

---

## Phase 3 — Docs + skills (the actual product)

### Task 3.1: AGENTS.md

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Write `AGENTS.md`**

````markdown
# Agent Instructions

You operate software through browser control on behalf of the user. This repo includes a small sandbox app (DemoCorp ERP) for the README's quickstart demo, but the headline use case is **pointing this approach at any website you want operated** — the user handles authentication, you handle the work.

## Security (must follow)

When operating any website, you are acting with the user's credentials and permissions. You can do anything the logged-in user can.

1. **Read-only by default.** Navigating and reading is always safe. Do it freely.
2. **Ask before any write action.** Before clicking Submit, Save, Delete, Approve, Send, or anything that modifies data, tell the user exactly what you're about to do and wait. Example: *"I'm about to click 'Submit Order' which will create a PO for $5,000. Proceed?"*
3. **Never enter credentials for external sites.** The user handles all login, MFA, and security challenges. The DemoCorp sandbox is the only exception — use the demo credentials below.
4. **Flag destructive actions clearly.** If you see Delete, Archive, Revoke, Transfer: *"This would permanently delete [X]. Are you sure?"*
5. **Stay in scope.** Only visit pages and perform actions the user asked for.

**Recommend to users:** for real systems, suggest a limited or service account rather than personal credentials. Start with read-only permissions and expand only as needed.

## What you can do

### DemoCorp sandbox (this repo's bundled app)

| User says | Run |
|-----------|-----|
| "run the demo" | `.devin/skills/demo/SKILL.md` — full worked walkthrough |
| "create an order for ..." | Fill the New Order form with what they described, submit it |
| "export the orders / approved orders" | Click Export CSV (filter first if needed). Save the file to `./exports/` in this repo, not `~/Downloads` |
| "analyze the CSV / make me a report" | `.devin/skills/analyze/SKILL.md` |
| "run the tests" | `npm test` (or `npx playwright test --headed` to watch) |

### Any website

| User says | Run |
|-----------|-----|
| "go to [url]" / "open [site]" | `.devin/skills/browse/SKILL.md` |
| "do [task] on [site]" | Navigate, user logs in, you do the work (with the security rules above) |

## DemoCorp setup

- **Dev server**: `npm run dev` on `http://localhost:5173`. Start it if not running.
- **Login**: `john.smith@democorp.example` / `Acme2024!`
- **Pages**: `/` (login), then in-app nav between Orders and New Order

## Browser-control essentials (Playwright MCP)

Key tools:
- `browser_navigate` — go to URL
- `browser_snapshot` — **call after every navigation** to get fresh element refs
- `browser_click`, `browser_fill_form` — interact
- `browser_console_messages` — check errors

Element refs (`e14` etc.) invalidate on navigation. Re-snapshot.

## Downloads — save to the project, not `~/Downloads`

For DemoCorp's Export CSV (and any equivalent on other sites): use the Playwright download event to redirect the file to `./exports/` in this repo. The agent skill files demonstrate the pattern.
````

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: AGENTS.md with security rules + skill pointers"
```

---

### Task 3.2: `.devin/skills/demo/SKILL.md` (the worked example)

**Files:**
- Create: `.devin/skills/demo/SKILL.md`

- [ ] **Step 1: Write `.devin/skills/demo/SKILL.md`**

````markdown
# DemoCorp ERP Live Demo

## Description
Worked end-to-end example of browser-driven agent on DemoCorp ERP, including the **browser → CSV → local HTML report → browser** loop. Use this as the template when teaching another site (`.devin/skills/browse/SKILL.md`) or when generating reports from any tabular site.

## Trigger
"run the demo", "demo the app", "show me the agent demo".

## Prerequisites
- Playwright MCP connected (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, etc.)
- Dev server on `http://localhost:5173` — start with `npm run dev` if not running

## Credentials
- Email: `john.smith@democorp.example`
- Password: `Acme2024!`

## Phases

### 1. Setup
1. Check the dev server is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`. If it's not `200`, run `npm run dev` in the background.
2. `mkdir -p exports reports` so the download and report destinations exist.
3. `browser_navigate` to `http://localhost:5173/`. `browser_snapshot` to confirm the login page.

Narrate: *"DemoCorp ERP — a small procurement sandbox. The login page is a stand-in for any corporate SSO."*

### 2. Login
4. `browser_fill_form` with `john.smith@democorp.example` / `Acme2024!`.
5. Click Sign In. `browser_snapshot` to confirm the Orders page.

Narrate: *"Logged in as John Smith, Procurement Manager. Now on the Orders page — eight POs across Draft, Submitted, and Approved."*

### 3. Filter + export the CSV
6. Click the **Approved** filter button. `browser_snapshot` to confirm only Approved rows remain.
7. Set up a download listener BEFORE clicking export. In Playwright MCP, this is typically `page.waitForEvent('download')` orchestrated by the MCP itself — check the MCP's docs for the exact form. The goal: capture the download to `./exports/orders-approved-<timestamp>.csv` in the project root, NOT `~/Downloads`.
8. Click **Export CSV**. Save the download to the project path.

Narrate: *"Exporting the approved orders. This is the trick that turns a browser demo into something useful — the file lands in the project directory where I can do real work with it locally."*

### 4. Local analysis
9. Read the CSV: `cat exports/orders-approved-*.csv | tail -n +2`.
10. In code (no need to involve the browser), compute:
    - Total spend
    - Spend by vendor (rank descending)
    - Spend by cost center
    - Largest single order

### 5. Generate the HTML report
11. Write a single self-contained HTML file to `reports/orders-approved-<timestamp>.html` containing:
    - A header with totals
    - A table of orders
    - At least one chart (your choice: inline SVG, Chart.js via CDN, plain bar divs)
    - Friendly enterprise-looking styling (system fonts, slate/blue palette, subtle borders)
    - All CSS/JS inlined so it opens cleanly via `file://`
12. The report MUST work without internet (avoid CDN-only deps where possible; if you use Chart.js, mention that the user needs to be online when opening — or generate inline SVG).

### 6. Show the payoff
13. `browser_navigate` to `file:///<absolute-path-to-reports>/orders-approved-<timestamp>.html`.
14. `browser_snapshot` and narrate what's on the report.

Narrate: *"This is the bridge — the agent operated a real-looking corporate app, captured live data, then synthesized a presentable report locally. One prompt, three different modalities."*

### 7. Wrap
15. Summarize: total spend exported, file paths created, what the user can do next ("you can hand me a different filter or a different site").
16. Leave the browser open on the report.

## Worked example output

After running this, you should have these files in the project:
- `exports/orders-approved-<timestamp>.csv` — the raw download
- `reports/orders-approved-<timestamp>.html` — the rendered report
- A browser tab still open on the report

## Failure modes
- **Dev server not starting**: port 5173 already in use → `lsof -ti:5173 | xargs kill`, retry.
- **Download not redirecting to project dir**: see fallback in `.devin/skills/browse/SKILL.md` — agent can `curl` the data directly if the MCP doesn't expose the download event.
- **Charts not rendering offline**: drop the CDN dep, use inline SVG.
````

- [ ] **Step 2: Commit**

```bash
git add .devin/skills/demo/SKILL.md
git commit -m "docs: demo skill — full browser to CSV to HTML report worked example"
```

---

### Task 3.3: `.devin/skills/browse/SKILL.md` (the BYO-site flow)

**Files:**
- Create: `.devin/skills/browse/SKILL.md`

- [ ] **Step 1: Write `.devin/skills/browse/SKILL.md`**

````markdown
# Bring Your Own Site

## Description
Operate any website the user points you at. The user handles login (you never see credentials); you read the page structure, follow their instructions, and ask before any write action.

## Trigger
"go to [url]", "open [website]", "do [task] on [site]", "let's explore [site]", "help me with my [tool]".

## Workflow

### 1. Open the site
1. `browser_navigate` to the URL the user provided.
2. `browser_snapshot` to read the page.
3. If you see a login form or auth wall:
   - Say: *"I've opened [site]. Please log in — I'll wait. When you're done, tell me 'in' or 'logged in.'"*
   - Do NOT enter credentials. Do NOT click "Continue with Google" etc.
   - Wait for the user.

### 2. Understand the page
4. After the user signals they're in (or if no auth was needed), `browser_snapshot` again.
5. Tell the user what you see in 2-3 sentences. Mention:
   - The kind of page it is (dashboard, list, form, etc.)
   - Visible navigation
   - Anything that looks read-only vs interactive

### 3. Do the work
6. The user gives you a task. Map it to one of these patterns:
   - **Read-only task** ("summarize", "find all X", "tell me what's here") → navigate, snapshot, read, report. Always safe.
   - **Single write** ("submit this form", "approve order 123") → confirm before clicking: *"I'm about to click [exact button] which will [exact effect]. Proceed?"* Wait for yes.
   - **Bulk write** ("approve all under $1000") → confirm count first: *"I see N matching items. I'll approve them one by one. Should I do all N, or pause after each?"*
   - **Destructive** (Delete, Archive, Revoke, Transfer) → never proceed without explicit per-action confirmation. *"This would permanently delete [X]. Are you sure?"*

### 4. Downloads
If the task involves downloading data (CSV, PDF, export):
- Save the file to `./exports/` in the current project, not `~/Downloads`.
- Use the Playwright download event (`page.waitForEvent('download')` + `download.saveAs(path)`) if the MCP exposes it.
- Fallback: inspect the page, find the download URL, `curl` it directly into `./exports/`.

### 5. Reporting back
After any work, summarize:
- What you read or did
- What changed (if anything)
- What's still pending (if anything)

## Training mode — teaching the agent a new site

When the user says "let's explore [site]" or "teach you how to use [tool]":
1. Open the site, let them log in
2. `browser_snapshot` and describe the layout
3. Ask them to walk you through ONE concrete workflow ("show me how you'd create a new vendor")
4. As they narrate, note each step and the selector/landmark you'd use
5. After the walkthrough, write a new SKILL.md to `.devin/skills/<site-name>/SKILL.md` capturing the workflow
6. Test it: run through the same workflow using only your new skill — adjust as needed

## Hard rules (security)
- Never enter credentials for external sites
- Read-only by default
- Ask before every write
- Never explore admin/settings/billing pages unless explicitly directed
- If you see anything that looks like another user's data (in a multi-tenant app), stop and ask
````

- [ ] **Step 2: Commit**

```bash
git add .devin/skills/browse/SKILL.md
git commit -m "docs: browse skill — BYO-site flow + training mode"
```

---

### Task 3.4: `.devin/skills/analyze/SKILL.md` (CSV → HTML report)

**Files:**
- Create: `.devin/skills/analyze/SKILL.md`

- [ ] **Step 1: Write `.devin/skills/analyze/SKILL.md`**

````markdown
# CSV → HTML Report

## Description
Given a CSV file in the project, produce a single self-contained HTML report next to it with at least one chart and a clear narrative. Opens cleanly via `file://`.

## Trigger
"analyze this CSV", "make me a report from [file]", "summarize the orders export", "turn this into a chart", "give me a write-up of the data".

## Workflow

### 1. Locate + read the CSV
1. If the user named a specific file, use it. Otherwise look in `./exports/` for the most recent CSV.
2. Read the file. Note the column headers and ~5 sample rows.

### 2. Understand the shape
3. Identify:
   - Numeric columns (good for sums, averages, distributions)
   - Categorical columns (good for groupings)
   - Date/time columns (good for timelines)
   - ID columns (skip for charts; use for table)

### 3. Pick the analysis
Default to: **total, top-N by category, distribution**. For example, for purchase orders:
- Total spend
- Top 5 vendors by spend (bar chart)
- Spend by cost center (donut or stacked bar)
- Largest single order

If the user said "look for anomalies" or "find outliers," add: rows >2σ from the mean of the primary numeric column, called out at the top.

### 4. Generate the HTML
4. Write to `./reports/<csv-basename>.html`.
5. Required structure:
   - `<!doctype html>` + `<html lang="en">` etc.
   - `<title>` matches the CSV
   - A header section: total / count / time range
   - At least one chart — your choice of:
     - **Inline SVG** (best — no deps, works offline)
     - Chart.js via CDN (acceptable if the user is online; note it in the report)
     - Plain CSS bar divs (acceptable as a fallback)
   - A table of the raw rows
   - A short narrative paragraph at the top describing what's interesting
6. Style: system font stack, slate/blue palette, subtle borders, no animations needed. Keep it under 800 lines of HTML/CSS/JS combined.

### 5. Open it
7. `browser_navigate` to `file:///<absolute-path-to-report>` (resolve the path with `realpath`).
8. `browser_snapshot` to confirm the page rendered.
9. Tell the user the report path and what's notable.

## Example narrative line

> *"Approved spend so far this period: $97,200 across 4 orders. Largest single order: $48,000 (CloudNet Infrastructure, CDN contract). Vendor concentration is high — top 2 vendors account for 76% of approved spend."*

That's the kind of one-paragraph payoff that makes the report worth opening.

## Failure modes
- **CSV malformed**: report the parse error, show the offending row, ask the user how to handle it.
- **Empty CSV**: report it, don't generate a chart.
- **Single-row CSV**: skip charts, just show the row in a styled card.
````

- [ ] **Step 2: Commit**

```bash
git add .devin/skills/analyze/SKILL.md
git commit -m "docs: analyze skill — CSV to self-contained HTML report"
```

---

### Task 3.5: README.md (the public-facing entry point)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# Web Agent Demo

A demo of AI agents operating enterprise software through **browser control alone** — no API integration required. The headline use case: point the agent at any website you can log into, and tell it what to do.

Most enterprise tools (SAP, Salesforce internal portals, ServiceNow customizations, vendor admin consoles) don't have convenient APIs or block direct integration. But if you can see it in a browser, an agent can use it. The browser becomes a universal integration layer.

This repo ships a tiny sandbox (DemoCorp ERP) so the quickstart has something concrete to demo against, plus three agent skills that generalize to any site.

## The wow moment

Run the demo. The agent:

1. Opens DemoCorp ERP in a real browser
2. Logs in (with sandbox credentials — never real ones for external sites)
3. Filters Approved orders, exports the CSV — **into this project's `exports/` directory**, not `~/Downloads`
4. Reads the CSV locally, computes totals + top vendors + outliers
5. Generates a self-contained HTML report with charts into `reports/`
6. Opens the report in the browser

One prompt, three modalities: web operation, local file work, data visualization.

## Quickstart

### Prerequisites

- Node 22 LTS (`.nvmrc` is included — `nvm use` if you have nvm)
- A coding agent that supports MCP servers (Devin CLI, Claude Code, Cursor, Windsurf, etc.)

### Install

```bash
git clone <this-repo>
cd web-agent-demo
nvm use   # or: brew install node@22 && export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
npm install
```

### Add Playwright MCP to your agent

Add to your agent's MCP config:

```json
{
  "mcpServers": {
    "mcp-playwright": {
      "command": "npx",
      "args": ["@nichochar/playwright-mcp@latest"]
    }
  }
}
```

Config locations:
- **Devin CLI:** `~/.config/devin/mcp.json`
- **Claude Code:** project `.mcp.json` or user-level config
- **Cursor / Windsurf:** see your tool's MCP docs

### Run the demo

```bash
cd web-agent-demo
# Start your agent in this directory, then tell it:
"run the demo"
```

The agent reads `AGENTS.md`, finds `.devin/skills/demo/`, and runs the full walkthrough.

## Other things to say

| You say | What happens |
|---|---|
| "run the demo" | Full browser → CSV → HTML report walkthrough |
| "create an order for 10 laptops from Vertex Technologies" | Agent fills the New Order form, submits |
| "export approved orders and make me a report" | Filter, export, analyze, render, open |
| "run the tests" | `npm test` — one Playwright smoke test |
| "go to https://your-internal-tool.com" | Agent opens the site, asks you to log in, then operates |
| "let's explore [some SaaS dashboard]" | Collaborative training session — agent maps the site, writes a new skill |

## Use it with your own sites

DemoCorp is just the warmup. The real value is browser-operating sites you already use.

```
"go to https://your-internal-portal.company.com"
```

The agent opens it and says: *"I've opened the site. Please log in — I'll wait."*

You log in (the agent never sees your credentials). Then:

```
"find all open purchase orders over $10,000"
"fill the new vendor form with these details: ..."
"summarize what's on this page"
```

See [.devin/skills/browse/SKILL.md](.devin/skills/browse/SKILL.md) for the full BYO-site workflow including training the agent on a new site.

### Security (please read)

When operating a site you've logged into, the agent has the same access you do — including the ability to modify or delete data. This repo's `AGENTS.md` defines the rules:

- **Read-only by default** — navigation and reading are always safe
- **Confirm before writes** — the agent asks before clicking Submit, Save, Delete, Approve
- **Flags destructive actions** — explicit warning before any delete or irreversible action
- **Never enters credentials for external sites** — you handle all login, MFA, security challenges

Recommended: for real systems, use a **limited or service account** rather than personal credentials. Start read-only and expand only as needed.

## Repo layout

```
web-agent-demo/
├── src/                 React app (3 pages, ~700 lines)
│   ├── pages/           LoginPage, OrdersPage, NewOrderPage
│   ├── components/      Layout, Button
│   ├── lib/csv.ts       CSV export utility (Blob download)
│   ├── data/seed.ts     Demo data
│   └── App.tsx          Page-state routing
├── tests/smoke.spec.ts  One Playwright test (login + export + new order)
├── AGENTS.md            Agent contract (auto-read by coding agents)
├── .devin/skills/       The actual product
│   ├── demo/            Worked DemoCorp walkthrough
│   ├── browse/          BYO-site flow
│   └── analyze/         CSV → HTML report
├── docs/superpowers/    Design spec + implementation plan
└── public/              Static assets
```

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node 22 LTS |
| Build | Vite 7 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v3.4 |
| Tests | Playwright (1 smoke test) |
| State | `useState` (no Redux, no Context, no Router) |
| Data | In-memory seed data in `src/data/seed.ts` |

## License

MIT
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README quickstart + BYO-site framing + repo map"
```

---

## Phase 4 — Pre-publish verification

### Task 4.1: Fresh-clone simulation

**Files:** none — this verifies what's on disk.

- [ ] **Step 1: Clean slate**

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
rm -rf node_modules dist exports reports
```

- [ ] **Step 2: Fresh install**

```bash
npm install
```

Expected: no EBADENGINE warnings, 0 vulnerabilities.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: build succeeds, `dist/assets/index-*.css` ≥ 10 kB.

- [ ] **Step 4: Smoke test**

```bash
npm test
```

Expected: 1 passed.

- [ ] **Step 5: Visual final check**

```bash
npm run dev &
sleep 2
open http://localhost:5173/
# Walk through: login → filter Approved → Export CSV (downloads to ~/Downloads in browser) →
# nav to New Order → submit → success card → back to Orders. Press Ctrl+C / kill when done.
lsof -ti:5173 | xargs kill
```

- [ ] **Step 6: Verify `.devin/config.local.json` is not staged**

```bash
git status --short
git check-ignore -v .devin/config.local.json
```

Expected: `.devin/config.local.json` does NOT appear in `git status`, and `git check-ignore` confirms it matches `.gitignore:N:.devin/config.local.json`.

- [ ] **Step 7: Final commit (only if anything changed)**

If `git status` is clean, skip. Otherwise:

```bash
git status
# Review what's left, decide whether to commit, then:
git add -A
git commit -m "chore: post-rebuild cleanup"
```

---

## Self-review checklist

After implementing, before considering the rebuild done:

- [ ] All eight seed orders render on the Orders page with proper Tailwind styling
- [ ] Filter buttons change which orders show
- [ ] Export CSV produces a downloadable file with valid CSV content
- [ ] New Order form validates (empty description, zero/negative amount blocked)
- [ ] Sign Out returns to the login page
- [ ] `npm test` passes
- [ ] No `mock-jira-mcp/`, no `ArchitecturePage`, no React Flow, no React Router in the source tree
- [ ] `.devin/skills/` contains exactly three skills: `demo/`, `browse/`, `analyze/`
- [ ] `README.md` quickstart works from a freshly cleaned `node_modules`
- [ ] `AGENTS.md` exists and is referenced by `README.md`
- [ ] `.nvmrc` says `22`, `package.json` has `"engines": { "node": "^22.0.0" }`
