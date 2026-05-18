# Run the Demo — orchestration

## Description
The 7-phase worked example that demonstrates the **browser → CSV → local HTML report → browser** loop. This is "the wow moment." It composes [`../democorp/SKILL.md`](../democorp/SKILL.md) (site mechanics), [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md) (browser-control), and [`../analyze/SKILL.md`](../analyze/SKILL.md) (CSV → HTML report).

## Trigger
"run the demo", "demo the app", "show me the agent demo", "let's see the wow moment".

## Prerequisites
- Playwright MCP connected
- Repo cloned, `npm install` done
- Node 22 (`.nvmrc` enforces it; `nvm use` if you have nvm)

## The 7 phases

### Phase 1 — Setup
1. Check the dev server: `curl -fsS http://localhost:5173/ >/dev/null` — if it fails, start it: `npm run dev &` and `until curl -fsS http://localhost:5173/ >/dev/null; do sleep 0.5; done`
2. `mkdir -p exports reports` so the destinations exist
3. `browser_navigate` to `http://localhost:5173/`, then `browser_snapshot` to confirm the login page
4. `browser_console_messages level="error"` — should be 0 real errors

**Narrate:** *"DemoCorp ERP — a small procurement sandbox. The login page is a stand-in for any corporate SSO. The agent never enters credentials on real sites; for this sandbox, we use the documented demo account."*

### Phase 2 — Login
5. `browser_fill_form` with `john.smith@acme-corp.com` / `Acme2024!` (refs from the snapshot in Phase 1)
6. `browser_click` Sign In (`getByTestId('sign-in-btn')` or the matching ref)
7. `browser_snapshot` to confirm the Orders page renders

**Narrate:** *"Logged in as John Smith, Procurement Manager. Now on the Orders page — eight POs across Draft, Submitted, and Approved."*

### Phase 3 — Filter + export
8. Click the **Approved** filter pill (`getByRole('button', { name: 'Approved', exact: true })`)
9. `browser_snapshot` — should show 4 Approved orders only
10. Capture the CSV via `browser_run_code_unsafe`:

    ```js
    async (page) => {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const path = `${process.cwd()}/exports/orders-approved-${ts}.csv`
      const downloadPromise = page.waitForEvent('download')
      await page.getByTestId('export-csv-btn').click()
      await (await downloadPromise).saveAs(path)
      return path
    }
    ```

    Capture the returned path — you'll need it in Phase 5.

**Narrate:** *"Filtering to Approved orders, then exporting. Watch the download path — this isn't ~/Downloads, it's the project's exports/ directory. That's the trick that bridges browser work to local file work."*

### Phase 4 — Local analysis
11. Read the CSV: use the file Read tool, or `cat exports/orders-approved-<ts>.csv`
12. Compute (in code or in your head for small CSVs):
    - Total spend
    - Spend by vendor (descending) — for the bar chart
    - Spend by cost center (descending) — for the second bar chart
    - Largest single order
    - Time range (min/max `createdAt`)
    - Optional: vendor concentration (top-2 share of total)

**Narrate:** *"Reading the CSV directly off disk now — no browser involved. Computing totals, top vendors, cost-center distribution. This is the part that's normally hard for browser-only demos: persistent local work on the data the browser surfaced."*

### Phase 5 — Generate the HTML report
13. Follow [`../analyze/SKILL.md`](../analyze/SKILL.md) to produce a single self-contained HTML file at `./reports/orders-approved-<ts>.html`. Use the timestamp from Phase 3 so the file pair stays grouped.

### Phase 6 — Show the payoff
14. `browser_navigate` to `http://localhost:5173/reports/orders-approved-<ts>.html` (Vite serves arbitrary files under the project root; `file://` is blocked by the MCP — see [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md))
15. `browser_snapshot` to confirm it rendered; `browser_console_messages level="error"` — favicon.ico 404 is benign, ignore it
16. `browser_take_screenshot` so the user can see the result in the conversation

**Narrate:** *"And here's the bridge closing. The agent operated a real-looking corporate app, captured live data, then synthesized a presentable report locally. One prompt, three modalities — web operation, file work, data visualization."*

### Phase 7 — Wrap
17. Summarize for the user:
    - The two file paths created (`exports/<...>.csv`, `reports/<...>.html`)
    - The headline numbers (total spend, largest order, vendor count)
    - What they can do next: "filter by a different status and re-export," "point me at one of your own sites," "ask me to analyze a CSV you already have"
18. Leave the browser open on the report

## Artifacts after a successful run

In the project root:

```
exports/
  orders-approved-<timestamp>.csv     # raw download from DemoCorp
reports/
  orders-approved-<timestamp>.html    # agent-generated, self-contained
```

Both directories are gitignored — they're per-clone, ephemeral, never end up in commits.

## Failure modes

| Symptom | Fix |
|---|---|
| Port 5173 in use | `lsof -ti:5173 \| xargs kill` then retry `npm run dev` |
| Tailwind classes look unstyled | You're probably on Tailwind v4 from an old fork. This repo pins v3.4 — `rm -rf node_modules dist && npm install` to be sure. |
| Download doesn't save to `./exports/` | Your MCP may not expose `run_code_unsafe`. Fall back to inspecting the page for the download URL and `curl`ing it directly — see `../browse/SKILL.md` for the pattern. |
| `file://` navigation refused | Use the dev-server URL instead (Phase 6 step 14). |
| Report renders unstyled | The CSS is inlined in the HTML — if it's broken, you have a syntax error in the `<style>` block. Run `cat reports/<file>.html \| head -100` and look at the `<style>` section. |
