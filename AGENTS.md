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
- **Login**: `john.smith@acme-corp.com` / `Acme2024!`
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
