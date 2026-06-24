# QA Demo — manual test case → live validation → durable automation

## Description
A **user-driven** demo (you, the presenter, are in the loop the whole time) that shows the loop a real QA/automation engineer runs with an agent:

1. Pull up the **TestTrack** board — a mock test-management tool (looks like Jira) hosted alongside DemoCorp ERP.
2. Pick a manual test case that has **no automated coverage yet**.
3. The agent **takes control of the browser** and walks the case live, end to end.
4. The presenter **confirms it was done correctly**.
5. The agent writes a **durable Playwright test** for that case.
6. Run the **whole suite headed** so the audience watches the regression net grow.
7. Open a **real GitHub PR** with the new test (presenter says "create a pr").
8. **Mark the story complete in TestTrack** — narrated as "use the TestTrack MCP to update the ticket": move it to Done and post a comment with a short summary + the PR link, then navigate to the ticket to show it actually changed.

This is deliberately different from [`../run-demo/SKILL.md`](../run-demo/SKILL.md), which is a hands-off autopilot walkthrough. This skill is **conversational and presenter-paced** — wait for the human at every checkpoint. Don't run ahead.

It composes [`../democorp/SKILL.md`](../democorp/SKILL.md) (site mechanics) and [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md) (browser control).

## Trigger
- "show me our test cases" / "open the test cases" / "open TestTrack" → **just open the board** (step A), then stop and wait.
- "let's do a test case" / "let's automate a test case" / "pick up ERP-201" / "validate this case" → the full flow below.

> Disambiguation: **"run the demo" → [`../run-demo/SKILL.md`](../run-demo/SKILL.md)** (autopilot). **"do a test case" / "QA demo" → this skill** (presenter-driven). If a single phrase is ambiguous ("demo"), ask which one.

## Prerequisites
- Playwright MCP connected
- Dev server reachable: `curl -fsS http://localhost:5173/ >/dev/null` — if not, `npm run dev &` and wait for it.
- Node 22 (`.nvmrc`).

## The board (TestTrack)

A second Vite entry hosted in the same app but branded as a separate product. It is the QA tool, **not** part of DemoCorp ERP.

| Thing | Value |
|---|---|
| URL | `http://localhost:5173/qa.html` |
| Project | `ERP — DemoCorp ERP`, board "Test Automation Backlog" |
| Columns | Backlog, To Do, In Progress, Done |
| Case data | `src/qa/testCases.ts` (edit here to add/retitle cases) |

Selectors:

| Element | Selector |
|---|---|
| A case card | `getByTestId('case-card-ERP-201')` (key-suffixed) |
| A column | `getByTestId('column-to-do')` (`backlog` / `to-do` / `in-progress` / `done`) |
| Open case detail drawer | click the card → `getByTestId('case-detail-ERP-201')` |
| Comments list in a drawer | `getByTestId('case-comments-ERP-201')` |
| Deep-link to a ticket | navigate to `http://localhost:5173/qa.html?case=ERP-201` — opens that drawer directly |
| Cross-link from ERP nav | `getByTestId('testtrack-link')` (opens `qa.html` in a new tab) |

### Updating a ticket — the "TestTrack MCP"

TestTrack tickets are **mutable at runtime**. There is no real Jira MCP server; instead the board exposes a `window.testtrack` API (backed by `localStorage`, defined in `src/qa/store.ts`) that you drive via `browser_evaluate`. **In the demo, narrate this as "updating the ticket through the TestTrack MCP" — mechanically you're calling this shim.** Changes persist across navigation/reload and the board re-renders live.

| Call (run via `browser_evaluate`) | Effect |
|---|---|
| `window.testtrack.complete('ERP-201', { comment: '<summary> PR: <url>' })` | Moves the ticket to **Done**, flips it to **automated**, and appends a comment. The headline wrap action. |
| `window.testtrack.setStatus('ERP-201', 'In Progress')` | Just change status. |
| `window.testtrack.addComment('ERP-201', { body: '...' })` | Append a comment (author defaults to "Devin (agent)"). |
| `window.testtrack.get('ERP-201')` | Read the ticket's current effective state (verify your update landed). |
| `window.testtrack.reset()` | **Clear all overrides — run this to reset the board to seed state before re-running the demo.** |

Any bare `https://…` URL in a comment body renders as a clickable link, so the PR link is live in the ticket.

**The live-demo candidates** are the two cases in **To Do** with the `needs-automation` label and `manual` badge:

- **ERP-201 — Search orders by vendor / PO # / description** (exercises the search box)
- **ERP-202 — Approve a submitted order updates its status** (exercises the Approve action)

Both map to DemoCorp features that have **no Playwright coverage yet** — that's the whole point. The four `Done` cases (ERP-101..104) are already covered by `tests/smoke.spec.ts`.

## Flow

### A. Open the board
1. Ensure dev server is up.
2. `browser_navigate` to `http://localhost:5173/qa.html`, then `browser_snapshot`.
3. `browser_console_messages level="error"` — favicon 404 is benign.

**Narrate:** *"This is TestTrack — our test-management tool, a separate product from the ERP. This board is the backlog of manual test cases we still need to turn into automated coverage. The four in Done already have Playwright tests; the two in To Do, tagged `needs-automation`, don't yet."*

Then **stop**. If the trigger was only "show me our test cases," wait for the presenter to pick one.

### B. Read the chosen case
4. When the presenter names a case (e.g. "let's do ERP-201"), click its card to open the detail drawer and `browser_snapshot`.
5. Read back the **Steps to reproduce** and the **Expected result** in one or two sentences so the audience hears the contract you're about to satisfy.

**Narrate:** *"ERP-201 says: search should narrow the table across PO #, vendor, and description, and clearing it restores everything. Let me go do that in the ERP now."*

### C. Validate live in the browser
6. `browser_navigate` to `http://localhost:5173/` and log into DemoCorp using the sandbox creds (see [`../democorp/SKILL.md`](../democorp/SKILL.md) — it's the only site where the agent enters credentials).
7. Execute the case's steps with `browser_snapshot` between state changes. Narrate each step against the test case's expected result.
8. **Security checkpoint — confirm before any write.** Per `AGENTS.md`: reading/filtering/searching is free, but **ERP-202 approves an order, which is a write.** Before clicking Approve, say: *"ERP-202 wants me to approve PO-2026-003. That's a state change. Confirm and I'll click Approve."* Wait for yes.
9. After the steps, state plainly whether the observed behavior matched the expected result.

Per-case validation hints:

- **ERP-201 (search):** type `Vertex` in `getByTestId('order-search')` → only Vertex rows; clear, type `003` → only `PO-2026-003`; clear → all rows back. Read-only, no confirmation needed.
- **ERP-202 (approve):** find a Submitted order (e.g. `PO-2026-003`), click `getByTestId('approve-btn-PO-2026-003')` **after presenter confirms**, verify `getByTestId('status-PO-2026-003')` now reads `Approved` and the row's Approve button is gone.

### D. Presenter approval gate — DO NOT SKIP
10. Ask explicitly: *"Did that match what ERP-201 expects? If you're happy, I'll write the automated test."* **Wait.** This is the moment the presenter wants to own ("after my approval that it did it correctly"). Do not write the test until they confirm.

### E. Write the durable Playwright test
11. Add a new spec under `tests/`, named for the case: `tests/erp-201-order-search.spec.ts` (or `erp-202-approve-order.spec.ts`). One `test()` per case key; put the case key in the test title.
12. **Model it on `tests/smoke.spec.ts`** — same login preamble, same selector conventions (`getByLabel`, `getByRole`, `getByTestId`). Assert the case's **expected result** specifically, not just "page loaded."
13. Keep it focused: this test should fail if that one behavior regresses. Don't re-test the whole app.

Skeleton (adapt to the chosen case):

```ts
import { test, expect } from '@playwright/test'

test('ERP-201 — search narrows orders by vendor / PO # / description', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('john.smith@democorp.example')
  await page.getByLabel('Password').fill('Acme2024!')
  await page.getByTestId('sign-in-btn').click()
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()

  const search = page.getByTestId('order-search')
  await search.fill('Vertex')
  await expect(page.getByText('PO-2026-001')).toBeVisible()
  await expect(page.getByText('PO-2026-002')).not.toBeVisible()

  await search.fill('003')
  await expect(page.getByText('PO-2026-003')).toBeVisible()
  await expect(page.getByText('PO-2026-001')).not.toBeVisible()

  await search.fill('')
  await expect(page.getByText('PO-2026-002')).toBeVisible()
})
```

For ERP-202, click `getByTestId('approve-btn-PO-2026-003')` and assert `getByTestId('status-PO-2026-003')` has text `Approved`.

### F. Run the suite headed (the payoff)
14. `npm run test:headed` so the audience watches every test drive a real browser — the old smoke test **plus the one just written**.
15. Report the pass count. *"Five tests now, all green — the case we validated by hand a minute ago is permanent regression coverage."*

### G. Create the PR (presenter says "create a pr")
This is a **real** GitHub PR — branch, commit, push, open. It's a write to the remote, so follow the git rules in the global instructions (no force-push, don't push to `main`, etc.).

16. Create a branch off the current one: `git checkout -b qa/<case-key-lower>-automation` (e.g. `qa/erp-201-automation`).
17. Stage **only the new test file** (and any app fix the case revealed): `git add tests/erp-201-order-search.spec.ts`.
18. Commit with a message referencing the case key (use the repo's commit format with the Devin trailer).
19. `git push -u origin qa/erp-201-automation`.
20. `gh pr create --title "test(ERP-201): automate order search" --body "..."` — body should summarize the validated case + that it's now covered. **Capture the PR URL from `gh`'s output** — you need it in the next step.

If `gh` isn't authenticated, stop and ask the presenter to `gh auth login` rather than guessing. If there's no remote configured, say so — the rest of the demo (ticket update) can still proceed with a placeholder note instead of a link.

### H. Close the loop in TestTrack (presenter says "mark the story complete / update the ticket")
Narrate this as **"updating the ticket through the TestTrack MCP."** Mechanically it's the `window.testtrack` shim (see "Updating a ticket" above).

21. `browser_navigate` to `http://localhost:5173/qa.html` (or keep the existing tab) so the update is visible.
22. Run via `browser_evaluate`, splicing in the **real PR URL from step 20**:

    ```js
    window.testtrack.complete('ERP-201', {
      comment: 'Validated manually, then automated with a Playwright test (suite green). PR: <PR_URL_FROM_STEP_20>',
    })
    ```

    Keep the summary to one or two sentences — what was validated + that it's automated now.
23. **Navigate to the ticket to show it changed:** `browser_navigate` to `http://localhost:5173/qa.html?case=ERP-201`, then `browser_snapshot`. The drawer should show **Status: Done**, the **automated** badge, and the new comment with the **clickable PR link**. `browser_take_screenshot` so the audience sees it.

**Narrate:** *"And the loop closes: the agent validated a manual case, wrote durable automation, opened a real PR, and pushed the result back to the ticket — status flipped to Done, automated, with a one-line summary and a link straight to the PR. That last hop is normally a context-switch a human does by hand."*

### I. Wrap and engage
Per the **Engagement principle** in `AGENTS.md`, don't stop at "done":
24. One-line recap: which case, what you validated, the new spec file, the green suite count, the PR, the updated ticket.
25. Ask one open question about the presenter's real testing work — *"What does your actual test backlog look like — is it manual cases like these, or are you starting from scratch?"*
26. Offer a structured next step (use the interactive prompt): e.g. `["Automate the other To Do case (ERP-202)" | "Point me at your real app and let's repeat this loop" | "That's the demo — wrap up"]`.
27. One question at a time; accept off-menu answers; stop when they signal stop.

## Resetting between runs
The board change is persisted in `localStorage`, so a completed ticket **stays** Done on the next run. Before re-demoing, reset it: `browser_navigate` to `qa.html`, then `browser_evaluate` → `window.testtrack.reset()`. (Step F's headed test run is unaffected — that's source, not board state.)

## Artifacts after a run
```
tests/
  erp-201-order-search.spec.ts     # (or erp-202-...) — the durable test just written
```
- New specs are real source — committed on the PR branch (unlike the gitignored exports/ and reports/).
- A real GitHub PR on branch `qa/<case>-automation`.
- The TestTrack ticket update is client-side only (localStorage) — nothing to commit, reset with `window.testtrack.reset()`.

## Failure modes

| Symptom | Fix |
|---|---|
| `qa.html` 404s | Dev server not restarted after adding the entry — restart `npm run dev`. Build check: `npm run build` lists `dist/qa.html`. |
| Board renders unstyled | Tailwind `content` glob must include `./qa.html` (it does) — restart dev server if you just edited config. |
| New test fails on first run | Good — that may be a real find. Re-walk the case in the browser; reconcile the assertion with actual behavior before "fixing" the app. |
| Presenter says behavior was wrong | Don't write a passing test around a bug. Note the discrepancy, treat the app behavior as the defect, and ask whether to file/fix it. |
| `--headed` opens nothing | You're likely headless-only in this environment; fall back to `npm test` and report results. |
| Ticket already shows Done / has old comments | Previous run's `localStorage` overrides persist. Reset: navigate to `qa.html`, `browser_evaluate` → `window.testtrack.reset()`. |
| `window.testtrack` is undefined | You're on `index.html` (the ERP), not `qa.html`. The API only exists on the TestTrack board. Navigate there first. |
| `gh` not authenticated / no remote | Stop and ask the presenter to `gh auth login` (don't guess creds). If there's genuinely no remote, skip the link and note it in the ticket comment instead. |
