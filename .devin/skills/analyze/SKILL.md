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
