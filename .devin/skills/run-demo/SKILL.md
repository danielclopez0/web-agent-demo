# Run the Demo — orchestration

## Description
The 7-phase worked example that demonstrates the **browser → CSV → local HTML report → browser** loop. This is "the wow moment." It composes [`../democorp/SKILL.md`](../democorp/SKILL.md) (site mechanics), [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md) (browser-control), and [`../analyze/SKILL.md`](../analyze/SKILL.md) (CSV → HTML report).

## Trigger
"run the demo", "demo the app", "show me the agent demo", "let's see the wow moment".

## Prerequisites
- Playwright MCP connected
- Repo cloned, `npm install` done
- Node 22 (`.nvmrc` enforces it; `nvm use` if you have nvm)

## Presenter output mode

During this demo, keep terminal output concise and audience-readable:
- Say at most one short sentence before each visible browser step.
- Do not narrate implementation details, code snippets, diffs, raw CSV contents, or full tool output.
- Do not announce routine checks unless they fail.
- Pause with one clear instruction when presenter authentication is required.
- Report only the artifact paths and headline numbers at the end.
- If a command/tool fails, summarize the issue in one sentence and continue or ask for help.

## The 7 phases

### Phase 1 — Setup
1. Check the dev server: `curl -fsS http://localhost:5173/ >/dev/null` — if it fails, start it: `npm run dev &` and `until curl -fsS http://localhost:5173/ >/dev/null; do sleep 0.5; done`
2. `mkdir -p exports reports` so the destinations exist
3. `browser_navigate` to `http://localhost:5173/?resetDemo=1`, then `browser_snapshot` to confirm the login page. The app clears DemoCorp login and TestTrack runtime overrides once, then removes the query param, so every demo starts from clean seed state.
4. `browser_console_messages level="error"` — should be 0 real errors

**Narrate:** *"DemoCorp ERP — a small procurement sandbox. The login page is a stand-in for corporate SSO. The agent never enters passwords: I prefill the demo service user, then the presenter authenticates in the browser."*

### Phase 2 — Login
5. If the login page appears, ensure the Corporate Email field is prefilled with `service.user@democorp.example`. Fill only that email if needed.
6. **Stop and ask the presenter to authenticate:** *"I need you to authenticate DemoCorp before I can continue. The service user is prefilled; for this sandbox, any password works. Please enter a password, click Sign In, and tell me when you're in."* Wait for the presenter.
7. After the presenter says they're in, `browser_snapshot` to confirm the Orders page renders. The app stores this demo session in browser localStorage, so later QA-demo steps can skip login in the same Playwright browser.

**Narrate:** *"Logged in as DemoCorp Service User, Procurement Automation. Now on the Orders page — eight POs across Draft, Submitted, and Approved."*

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
14. Open the report in a **new browser tab** with `browser_tabs action="new" url="http://localhost:5173/reports/orders-approved-<ts>.html"` (Vite serves arbitrary files under the project root; `file://` is blocked by the MCP — see [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md)). Leave the DemoCorp ERP tab open behind it so the audience can see the handoff from app → generated artifact.
15. `browser_snapshot` in the new tab to confirm it rendered; `browser_console_messages level="error"` — favicon.ico 404 is benign, ignore it
16. `browser_take_screenshot` so the user can see the result in the conversation

**Narrate:** *"And here's the bridge closing. The agent operated a real-looking corporate app, captured live data, then synthesized a presentable report locally. One prompt, three modalities — web operation, file work, data visualization."*

### Phase 7 — Wrap and engage

The finished demo is the most important moment of the whole flow — the user just watched a complete loop, their attention is on you, and they're forming an opinion about whether this is *actually useful to them*. Don't waste it on a goodbye. See the **Engagement principle** in `AGENTS.md`.

17. **One-paragraph recap.** Headline numbers + file paths. Keep it tight.

    Example: *"Quick recap: $62,400 across 4 approved orders, top vendor Vertex at $26K, full report saved to `reports/orders-approved-2026-05-18T18-38-43.html`. Browser is still open on it."*

18. **Ask one open question about the user.** Don't suggest yet — listen first. Pick whichever fits the moment:

    - *"Now I'm curious — what do you actually work on day-to-day? Even a short answer helps me suggest where to go next."*
    - *"Is there a tool you use that you wish had an API, but doesn't?"*
    - *"What's a workflow you do by hand right now that you'd want an agent to take over?"*

    Use prose here. This is context-gathering, not a multiple-choice question. Wait for the answer.

19. **Based on the answer, offer a specific next step.** This is where a structured-question tool earns its keep — if your platform exposes one (`AskUserQuestion` in Claude Code, interactive prompts in Devin, etc.), use it to offer 2–3 concrete branches:

    Examples of structured follow-ups (pick the one that matches their answer):

    - User mentioned a specific tool/SaaS: `["Point me at it — I'll open it and we'll explore" | "Just curious for now, no need to operate it" | "Show me a different DemoCorp flow instead"]`
    - User described a workflow they do by hand: `["Walk me through it on the real tool" | "Show me how I'd write a skill for it" | "Not now — what else can DemoCorp demo?"]`
    - User said "I just wanted to see what's possible": `["Want me to analyze a CSV you already have lying around?" | "Want to see the same flow with a different filter?" | "Good — I'll be here when you have something specific"]`

    The branch they pick tells you exactly which skill to load next:
    - "Point me at it" / "Walk me through it" → `../browse/SKILL.md`
    - "Different DemoCorp flow" → `../democorp/SKILL.md`
    - "Analyze a CSV" → `../analyze/SKILL.md`
    - "Write a skill for it" → `../browse/SKILL.md` training mode section

20. **One question at a time.** Don't stack three questions hoping one lands. Ask, wait, respond, repeat.

21. **Always accept open input.** If they type something off-menu (*"actually can you re-export but only orders over $10K?"*), that's the most useful kind of answer — they're telling you exactly what they want. Run it.

22. **Stop when they signal stop.** *"Cool, that's enough"* / *"thanks, I'll explore on my own"* → leave the browser open, summarize what they have in `./reports/` and `./exports/`, exit cleanly. Don't push for more.

23. **Leave the browser open** on the report regardless of how the conversation ends — it's a passive reminder of what just happened.

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
