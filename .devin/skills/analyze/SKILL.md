# CSV → HTML Report

## Description
Given a CSV file in the project, produce a single self-contained HTML report next to it with at least one chart and a clear narrative. Opens cleanly via the dev server.

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
   - ID columns (skip for charts; show in the table)

### 3. Pick the analysis
Default to: **total, top-N by category, distribution**. For purchase orders specifically:
- Total spend
- Top 5 vendors by spend (bar chart)
- Spend by cost center (bar chart or stacked)
- Largest single order

If the user said "look for anomalies" or "find outliers," add: rows >2σ from the mean of the primary numeric column, called out at the top.

### 4. Generate the HTML
4. Write to `./reports/<csv-basename>.html`.
5. Required structure:
   - `<!doctype html>` + `<html lang="en">`
   - `<title>` matches the report subject
   - A header section with totals/count/time-range KPI cards
   - At least one chart (see chart options below)
   - A table of the raw rows with status badges
   - A short narrative paragraph at the top describing what's interesting
6. Style: system font stack, slate/blue palette, subtle borders, no animations. Keep total HTML+CSS under ~800 lines.

#### Chart options

| Choice | When to use |
|---|---|
| **Inline SVG** | Best — no deps, works offline, renders identically everywhere. |
| **Plain CSS bar divs** | Acceptable fallback. Compute widths in CSS, e.g. `width: ${100 * value / max}%`. |
| **Chart.js via CDN** | Acceptable when the user has internet. Note it in the report so offline-opening doesn't surprise them. |

For CSS bar charts specifically — **compute bar widths from the data, don't hand-type them**:

```html
<div class="bar-row">
  <div class="name">Vertex Technologies</div>
  <div class="bar-track"><div class="bar-fill" style="width: 100%;"></div></div>
  <div class="val">$26,000</div>
</div>
<div class="bar-row">
  <div class="name">Northwind Industrial</div>
  <!-- 18750 / 26000 = 72.1 -->
  <div class="bar-track"><div class="bar-fill" style="width: 72.1%;"></div></div>
  <div class="val">$18,750</div>
</div>
```

Always normalize relative to the *max* row (not total), so the largest bar fills the track.

### 5. Open it
7. Most Playwright MCPs block `file://` — see [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md#file-urls-are-blocked) for workarounds. Two paths that work:
   - **If the DemoCorp dev server is running** (most common state during a demo flow): `browser_navigate` to `http://localhost:5173/reports/<basename>.html`. Vite serves arbitrary files under the project root.
   - **Otherwise**: shell out to `open ./reports/<basename>.html` (macOS) or `xdg-open ./reports/<basename>.html` (Linux). Launches the user's default browser outside Playwright — you can't snapshot it, but the user sees it.
8. If using the dev-server path: `browser_snapshot` to confirm rendering, `browser_console_messages level="error"` (favicon.ico 404 is benign — ignore it).
9. `browser_take_screenshot` so the user sees the result in the conversation.
10. Tell the user the report path and the one-paragraph narrative summary.

## Example narrative line

> *"Approved spend so far this period: $62,400 across 4 orders. Largest single order: $26,000 (Vertex Technologies, Dell PowerEdge servers). Vendor concentration is high — top 2 vendors account for 71.6% of approved spend. CC-1004 IT Infrastructure absorbs 41.7% of the period's spend."*

That's the kind of one-paragraph payoff that makes the report worth opening.

## Failure modes
- **CSV malformed**: report the parse error, show the offending row, ask the user how to handle it.
- **Empty CSV**: report it, don't generate a chart, just a one-line note.
- **Single-row CSV**: skip charts, show the row in a styled card.
- **Report shows unstyled**: you have a syntax error in the inlined `<style>` block. Check the first ~100 lines of the generated file.
