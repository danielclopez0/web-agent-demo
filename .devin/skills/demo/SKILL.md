# DemoCorp ERP Live Demo

## Description
Worked end-to-end example of browser-driven agent on DemoCorp ERP, including the **browser → CSV → local HTML report → browser** loop. Use this as the template when teaching another site (`.devin/skills/browse/SKILL.md`) or when generating reports from any tabular site.

## Trigger
"run the demo", "demo the app", "show me the agent demo".

## Prerequisites
- Playwright MCP connected (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, etc.)
- Dev server on `http://localhost:5173` — start with `npm run dev` if not running

## Credentials
- Email: `john.smith@acme-corp.com`
- Password: `Acme2024!`

## Phases

### 1. Setup
1. Check the dev server is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`. If it's not `200`, run `npm run dev` in the background.
2. `mkdir -p exports reports` so the download and report destinations exist.
3. `browser_navigate` to `http://localhost:5173/`. `browser_snapshot` to confirm the login page.

Narrate: *"DemoCorp ERP — a small procurement sandbox. The login page is a stand-in for any corporate SSO."*

### 2. Login
4. `browser_fill_form` with `john.smith@acme-corp.com` / `Acme2024!`.
5. Click Sign In. `browser_snapshot` to confirm the Orders page.

Narrate: *"Logged in as John Smith, Procurement Manager. Now on the Orders page — eight POs across Draft, Submitted, and Approved."*

### 3. Filter + export the CSV
6. Click the **Approved** filter button. `browser_snapshot` to confirm only Approved rows remain.
7. Capture the download to the project's `exports/` directory using Playwright's download event. With a Playwright MCP that exposes a `run_code_unsafe`-style tool (or a dedicated download wrapper), the pattern is:

   ```js
   async (page) => {
     const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
     const path = `<absolute-project-path>/exports/orders-approved-${ts}.csv`
     const downloadPromise = page.waitForEvent('download')
     await page.getByTestId('export-csv-btn').click()
     const download = await downloadPromise
     await download.saveAs(path)
     return path
   }
   ```

8. Verified working with `@nichochar/playwright-mcp` and `mcp__playwright__browser_run_code_unsafe` during the rebuild dry-run. If your MCP does not expose download handling, fall back to `curl` — see `.devin/skills/browse/SKILL.md`.

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
13. Open the report in the browser. Most Playwright MCPs block `file://` URLs for security, so use the running Vite dev server instead — it serves any file under the project root. Navigate to `http://localhost:5173/reports/orders-approved-<timestamp>.html`. (If the dev server isn't running, start it first, or `open ./reports/<filename>` to launch the user's default browser outside of Playwright.)
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
