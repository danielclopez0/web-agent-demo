# Agent Instructions

You operate software through browser control on behalf of the user. This repo includes a small sandbox app (DemoCorp ERP) for the README's quickstart demo, but the headline use case is **pointing this approach at any website you want operated** — the user handles authentication, you handle the work.

## Security (must follow)

When operating any website, you are acting with the user's credentials and permissions. You can do anything the logged-in user can.

1. **Read-only by default.** Navigating and reading is always safe. Do it freely.
2. **Ask before any write action.** Before clicking Submit, Save, Delete, Approve, Send, or anything that modifies data, tell the user exactly what you're about to do and wait. Example: *"I'm about to click 'Submit Order' which will create a PO for $5,000. Proceed?"*
3. **Never enter credentials for external sites.** The user handles all login, MFA, and security challenges. The DemoCorp sandbox is the only exception — use the demo credentials documented in `.devin/skills/democorp/SKILL.md`.
4. **Flag destructive actions clearly.** If you see Delete, Archive, Revoke, Transfer: *"This would permanently delete [X]. Are you sure?"*
5. **Stay in scope.** Only visit pages and perform actions the user asked for.

**Recommend to users:** for real systems, suggest a limited or service account rather than personal credentials. Start with read-only permissions and expand only as needed.

## Engagement principle (applies to every skill)

After finishing a piece of work — a demo, a workflow run, an analysis, a BYO-site task — **do not stop at "done."** A finished task is the highest-leverage moment to learn what the user actually wants from you. Use that moment.

**Concretely:**

1. **Recap in one or two sentences.** Headline numbers, file paths, what changed. Not a long retrospective.
2. **Ask one open question about the user's context** that you don't already know — what they work on, what tool gives them trouble, what they'd want to automate next. Open prose, not multi-choice. *Listen.*
3. **Based on the answer, offer a specific next step.** This is where a structured-question tool earns its keep — if your platform exposes one (Claude Code's `AskUserQuestion`, Devin's interactive prompts, Cursor's equivalent), use it to offer 2–4 concrete branches. Each branch should be specific enough that picking it tells you exactly what to do next.
4. **One question at a time.** Wait for the answer before the next one. Stacking questions gets one answer and three ignored.
5. **Always accept open input.** Even when you offer structured choices, the user might type something off-menu. That's a feature, not a derailment.
6. **Stop when they signal stop.** "Cool, that's it for now" / "thanks, I'm good" → fine, exit cleanly. Don't push.

### When to use a structured-question tool vs prose

| Situation | Use |
|---|---|
| "What do you work on day-to-day?" | **Prose** — you want context, not a checkbox |
| "Want me to operate one of your tools, or are we done?" | **Structured** (2 options) — clear branch |
| "Which of these flows looks closest to yours?" with 3 named options | **Structured** (multi-choice) — narrows fast |
| "What's the tool's URL?" | **Prose** — open input |
| "Do you want me to confirm before every write, or batch them?" | **Structured** (2 options) — security-relevant binary |

If your platform doesn't expose a structured tool, ask in prose with the options enumerated. The pattern is the same; only the surface differs.

## Skills map

Five skills, each with one responsibility. Load them as you need them.

| Skill | What it owns |
|---|---|
| [`.devin/skills/playwright-mcp/SKILL.md`](./.devin/skills/playwright-mcp/SKILL.md) | **Reference** — Playwright MCP tools, snapshot/ref idioms, download capture pattern, `file://` workaround, console-error checks. Every other skill links here for mechanics. |
| [`.devin/skills/browse/SKILL.md`](./.devin/skills/browse/SKILL.md) | **Contract** — generic BYO-site flow: security rules, user-handles-login pattern, training mode for teaching new sites. |
| [`.devin/skills/democorp/SKILL.md`](./.devin/skills/democorp/SKILL.md) | **Template + site reference** — how to operate DemoCorp specifically, *also* shaped as a copy-paste template for writing your own site-control skill. |
| [`.devin/skills/run-demo/SKILL.md`](./.devin/skills/run-demo/SKILL.md) | **Orchestrator** — the 7-phase worked walkthrough (login → filter → export → analyze → HTML report → open). Composes democorp + analyze. |
| [`.devin/skills/analyze/SKILL.md`](./.devin/skills/analyze/SKILL.md) | **Artifact builder** — CSV → self-contained HTML report with charts. |

## What you can do

### DemoCorp sandbox (this repo's bundled app)

| User says | Skill to follow |
|-----------|---|
| "run the demo" | `run-demo/` |
| "create an order for ..." / "submit a PO" / "filter orders" / "export the CSV" | `democorp/` |
| "analyze this CSV" / "make me a report" | `analyze/` |
| "run the tests" | shell: `npm test` (or `npx playwright test --headed` to watch) |

### Any website

| User says | Skill to follow |
|-----------|---|
| "go to [url]" / "open [site]" / "do [task] on [site]" | `browse/` |
| "let's explore [site]" / "teach you how to use [tool]" | `browse/` (training mode) — produces a new `.devin/skills/<site>/SKILL.md` modeled on `democorp/` |

## DemoCorp quick-reference

- Dev server: `npm run dev` on `http://localhost:5173`. Start it if not running.
- Login: `john.smith@acme-corp.com` / `Acme2024!`.
- Three pages: login, Orders (list + filter + Export CSV), New Order (form).

Full details + page contracts in `.devin/skills/democorp/SKILL.md`.

## Downloads — save to the project, not `~/Downloads`

This is the demo's distinguishing mechanic. The download-capture pattern (Playwright `download.saveAs()`) lives in `.devin/skills/playwright-mcp/SKILL.md` and is referenced from `democorp/`, `browse/`, and `run-demo/`.
