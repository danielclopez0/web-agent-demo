# Web Agent Demo

A demo of AI agents operating enterprise software through **browser control alone** — no API integration required. The headline use case: point the agent at any website you can log into, and tell it what to do.

Most enterprise tools (SAP, Salesforce internal portals, ServiceNow customizations, vendor admin consoles) don't have convenient APIs or block direct integration. But if you can see it in a browser, an agent can use it. The browser becomes a universal integration layer.

This repo ships a tiny sandbox (DemoCorp ERP) so the quickstart has something concrete to demo against, plus three agent skills that generalize to any site.

## The wow moment

Run the demo. The agent:

1. Opens DemoCorp ERP in a real browser
2. Pauses for presenter authentication (service user is prefilled; any password works in the sandbox)
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

The agent reads `AGENTS.md`, finds `.devin/skills/run-demo/`, and walks the 7 phases (login → filter → export → analyze → HTML report → open).

## Other things to say

| You say | What happens |
|---|---|
| "run the demo" | Hands-off autopilot: browser → CSV → HTML report walkthrough |
| "show me our test cases" | Opens **TestTrack**, the mock QA board (looks like Jira), in a new tab |
| "let's do a test case" | Presenter-driven: agent validates a manual case live, you approve, it writes the Playwright test, runs the suite headed, opens a PR, and marks the ticket Done |
| "create an order for 10 laptops from Vertex Technologies" | Agent fills the New Order form, submits |
| "export approved orders and make me a report" | Filter, export, analyze, render, open |
| "run the tests" | `npm test` — the Playwright suite |
| "go to https://your-internal-tool.com" | Agent opens the site, asks you to log in, then operates |
| "let's explore [some SaaS dashboard]" | Collaborative training session — agent maps the site, writes a new skill |

### Two demos, on purpose

- **`run the demo`** — the **autopilot** loop (browser → file → report). Hands-off; great for a first "wow."
- **`let's do a test case`** — the **QA / test-automation** loop, paced by *you*. Pull up the **TestTrack** board (a mock Jira-style tool hosted at `/qa.html`), point the agent at a manual test case with no coverage, watch it drive the browser, approve that it did it right, and then it writes a **durable Playwright test**. Run the whole suite headed, have it open a **real GitHub PR**, and finally **"update the ticket via the TestTrack MCP"** — which moves the story to Done and posts a comment with a one-line summary and a clickable link to the PR. (The TestTrack "MCP" is a small client-side shim over mock data — `window.testtrack` in `src/qa/store.ts` — so the ticket genuinely changes on screen.) This mirrors how you actually work with the agent, with a human approval gate at each step.

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

See [.devin/skills/browse/SKILL.md](.devin/skills/browse/SKILL.md) for the BYO-site contract (security + training mode) and [.devin/skills/democorp/SKILL.md](.devin/skills/democorp/SKILL.md) for the copy-paste template when you're ready to write a skill for a site of your own.

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
├── index.html           DemoCorp ERP entry
├── qa.html              TestTrack entry (the mock QA board — a separate "site")
├── src/
│   ├── pages/           LoginPage, OrdersPage (filter + search + approve), NewOrderPage
│   ├── components/      Layout, Button
│   ├── lib/csv.ts       CSV export utility (Blob download)
│   ├── data/seed.ts     DemoCorp demo data
│   ├── qa/              TestTrack board: QaApp.tsx + testCases.ts (seed) + store.ts (window.testtrack "MCP")
│   └── App.tsx          Page-state routing
├── tests/smoke.spec.ts  Playwright smoke test (login + filter + export + new order)
├── AGENTS.md            Agent contract (auto-read by coding agents)
├── .devin/skills/       The actual product
│   ├── playwright-mcp/  MCP reference (tools, idioms, gotchas)
│   ├── browse/          Generic BYO-site contract + training mode
│   ├── democorp/        DemoCorp site reference + template for your own
│   ├── run-demo/        7-phase autopilot walkthrough (the wow moment)
│   ├── qa-demo/         Presenter-driven QA loop (test case → live validate → write test)
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
