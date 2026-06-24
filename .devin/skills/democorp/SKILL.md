# DemoCorp ERP — site reference + skill template

## Description
DemoCorp ERP is the small sandbox app bundled with this repo. This skill is **both** a site reference (so the agent can operate it) **and a template** for writing a similar skill for any other site you want the agent to drive.

If you're writing a new `.devin/skills/<your-site>/SKILL.md`, copy this file and replace each section with your site's specifics.

## Trigger
Anything DemoCorp-specific:
- "create an order for ..."
- "export the orders / approved orders"
- "filter / show me the orders that ..."
- "submit a PO"

For the full narrated walkthrough, see [`../run-demo/SKILL.md`](../run-demo/SKILL.md).
For the BYO-site flow (any URL the user points you at), see [`../browse/SKILL.md`](../browse/SKILL.md).
For browser-control mechanics, see [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md).

## Setup (template section: prerequisites + how to launch the site)

- **Dev server**: `npm run dev` on `http://localhost:5173`.
- **Check before navigating**: `curl -fsS http://localhost:5173/ >/dev/null` — start with `npm run dev &` if it returns non-zero.
- **Node version**: `.nvmrc` pins Node 22 LTS. Use `nvm use` if you have nvm.

## Credentials (template section: how the agent authenticates)

DemoCorp is a sandbox. During the live `run-demo/` flow, the agent may prefill the service-user email, but the presenter enters the password in the browser.

| Field | Value |
|---|---|
| Email | `service.user@democorp.example` |
| Password | Any non-empty value; the presenter types it during the demo |
| Role rendered after login | Procurement Automation |

For real sites: **never enter credentials**. The user does that. See [`../browse/SKILL.md`](../browse/SKILL.md).

## Routes (template section: page map)

| Path | Page | Purpose |
|---|---|---|
| `/` (unauthenticated) | LoginPage | Email + password form |
| `/` (after login) | OrdersPage | Default — table of POs with status filter + Export CSV |
| In-app nav button "New Order" | NewOrderPage | Form to create a new PO; shows success card on submit |

There is no router — page state is held in `App.tsx`. Navigation happens via in-app buttons, not URL paths.

## Page contract (template section: per-page, what's there and how to interact)

### LoginPage

| Element | Selector preference |
|---|---|
| Email field | `getByLabel('Corporate Email')` or `#email` |
| Password field | `getByLabel('Password')` or `#password` |
| Sign In button | `getByTestId('sign-in-btn')` |
| Error message (on bad creds) | `getByTestId('login-error')` — `role="alert"` |

### OrdersPage

| Element | Selector preference |
|---|---|
| Heading | `getByRole('heading', { name: 'Purchase Orders' })` |
| Filter pills | `getByRole('button', { name: 'All' \| 'Draft' \| 'Submitted' \| 'Approved', exact: true })` |
| Search box | `getByTestId('order-search')` — free-text match across PO #, vendor, description; composes with the status filter |
| Export CSV button | `getByTestId('export-csv-btn')` |
| Order rows | `getByTestId('order-row-<PO id>')`; first `<td>` is the monospace PO ID |
| Status badge (per row) | `getByTestId('status-<PO id>')` — text is `Draft` / `Submitted` / `Approved` |
| Approve button (per row) | `getByTestId('approve-btn-<PO id>')` — present only on non-Approved rows; sets status to Approved in place |

The table re-renders when a filter is clicked, when search text changes, or after an Approve. Re-snapshot afterward.

> **Approve is a write.** Clicking Approve changes an order's status. Confirm with the user before clicking it, per the security rules in `AGENTS.md`.

### NewOrderPage

| Element | Selector preference |
|---|---|
| Vendor dropdown | `getByLabel('Vendor')` — `<select>`, 5 options |
| Description input | `getByLabel('Description')` |
| Amount input | `getByLabel('Amount (USD)')` — `<input type="number">` |
| Cost Center dropdown | `getByLabel('Cost Center')` |
| Submit button | `getByTestId('submit-order-btn')` |
| Cancel button | `getByRole('button', { name: 'Cancel' })` |
| Success card (after submit) | `getByTestId('new-order-success')` |
| Validation error | `getByTestId('form-error')` |

## Common workflows (template section: scripted user intents → button presses)

### Create a PO
1. Click "New Order" in the top nav.
2. `browser_fill_form` with the four fields. Use the dropdowns' visible text for Vendor + Cost Center.
3. **Confirm before submitting** if amount > $5000 (or whatever the user's threshold is): *"I'm about to submit a PO for $X to Vendor Y. Proceed?"*
4. Click Submit. Re-snapshot. Confirm the success card is visible.
5. Click "Back to Orders" to return to the list. The new PO appears at the top.

### Filter + count orders by status
1. On OrdersPage, click the filter pill (`All` / `Draft` / `Submitted` / `Approved`).
2. Re-snapshot.
3. Count rows under `<tbody>`. Report.

### Search orders
1. Type into `getByTestId('order-search')` — matches PO #, vendor, or description.
2. Re-snapshot; the table narrows live. Search composes with the active status filter.
3. Clear the box to restore the full (filtered) list. Read-only — no confirmation needed.

### Approve an order (write — confirm first)
1. Find the target row (`getByTestId('order-row-<id>')`); non-Approved rows show an Approve button.
2. **Confirm:** *"I'm about to approve <PO id>. That changes its status. Proceed?"* Wait for yes.
3. Click `getByTestId('approve-btn-<id>')`. Re-snapshot.
4. Verify `getByTestId('status-<id>')` now reads `Approved` and the row's Approve button is gone.

### Export CSV to the project directory
Use the download-capture pattern in [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md). Save to `./exports/<filename>` — never `~/Downloads`.

```js
async (page) => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const path = `${process.cwd()}/exports/orders-${ts}.csv`
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('export-csv-btn').click()
  await (await downloadPromise).saveAs(path)
  return path
}
```

Filter first if the user said "approved orders" — the CSV reflects the current filter.

## Demo data invariants (template section: what to expect)

State is in-memory. Resets on page refresh.

- 8 seed orders, IDs `PO-2026-001` through `PO-2026-008`
- Statuses split: 4 Approved, 3 Submitted, 1 Draft
- 5 vendors, 5 cost centers
- New orders created in the form are added at the top of the list with `status: 'Submitted'`

If a refresh wipes a freshly-created PO, that's expected — flag it for the user before they're confused.

---

## Writing your own site skill

Copy this file to `.devin/skills/<your-site>/SKILL.md` and replace every section:

| Section | What to put |
|---|---|
| **Description** | What the site is, why an agent would operate it |
| **Trigger** | The user phrases that should activate this skill |
| **Setup** | URL, env vars, prerequisites, how to know the site is reachable |
| **Credentials** | For real sites: a note that the user handles login. The agent never enters credentials except in sandboxes. |
| **Routes** | Path → page → purpose. Even SPA sites have logical "pages" — list them. |
| **Page contract** | For each page: the elements you'll interact with + how to find them. Prefer `getByRole`/`getByLabel`/`getByTestId` over CSS selectors (more stable). |
| **Common workflows** | Scripted: user intent → exact sequence of clicks, with confirm-before-write checkpoints. |
| **Demo data invariants** | What's stable about the data, what resets, what the agent should warn the user about. |

When you're done, follow `../browse/SKILL.md` step 5 ("Test it") — run through one of your own workflows using only the skill text. If the skill misses a step, fix it. That's the skill validating itself.
