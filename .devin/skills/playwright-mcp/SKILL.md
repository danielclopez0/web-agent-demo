# Playwright MCP — agent reference

## Description
The Playwright MCP server is how the agent drives a real browser. This skill is the reference: tool catalog, idioms, gotchas. Every other site-control skill should link here instead of re-explaining mechanics.

## Tool catalog

| Tool | When to use |
|---|---|
| `browser_navigate` | Go to a URL. Triggers a fresh page; all refs from prior snapshots are now invalid. |
| `browser_snapshot` | Read the current page as a structured accessibility tree. **Call after every navigation and every state change** — this is how you get fresh `eN` refs. Returns nothing visual; use `browser_take_screenshot` for that. |
| `browser_click` | Click an element. Prefer the `eN` ref from the most recent snapshot over CSS selectors. |
| `browser_fill_form` | Fill multiple fields in one call. Faster than per-field clicks. |
| `browser_evaluate` | Run a JS expression in the *page* context. Safe — just runs in the renderer. Use for reading state, computing values, triggering small DOM-level things. |
| `browser_run_code_unsafe` | Run a JS function in the *Playwright server* context, with full `page` object access. Required for download capture, network interception, file uploads with timing, etc. The "unsafe" label is because it's RCE-equivalent in the server process — fine when YOU are writing the code; never pass untrusted strings here. |
| `browser_console_messages` | Read browser-console output. **Run this after every navigation** with `level: 'error'` — silent JS errors break demos. |
| `browser_take_screenshot` | Visual snapshot. Use for visual verification, never for finding elements (that's `browser_snapshot`'s job). |
| `browser_wait_for` | Wait for text to appear/disappear or for a fixed time. Better than `sleep` because it returns early on success. |
| `browser_close` | Close the page when done. |

## The snapshot-first idiom

Element refs (`e14`, `e28`, etc.) are scoped to the snapshot that produced them. After ANY of these, refs are invalid:

- `browser_navigate` to a new URL
- Anything that triggers a single-page-app route change
- Any click that mutates the DOM significantly (modals, dropdowns, form submission)
- Time passing on a page that polls or live-updates

The pattern:

```
1. browser_snapshot          → get fresh refs e1, e2, e3...
2. browser_click target=e14  → use a ref from THIS snapshot
3. browser_snapshot          → page changed, get fresh refs again
4. browser_click target=e22  → use a ref from THIS snapshot
```

**Don't reuse refs across snapshots.** It will either fail or — worse — click the wrong element if the page restructured.

## Prefer refs over CSS selectors

After a snapshot, you have `eN` refs. Use them:

```
browser_click target="e14"  ✓
browser_click target="[data-testid='sign-in-btn']"  ✗ (slower, brittle)
```

Refs are direct handles Playwright already resolved. CSS selectors do another lookup. The ref form is faster *and* more correct (it survives DOM reshuffling that a CSS selector wouldn't).

Use CSS selectors when you don't have a snapshot yet (rare) or when the element isn't in the accessibility tree.

## Downloads — capture to the project directory

This is the demo's distinguishing mechanic. Standard pattern:

```js
async (page) => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const path = `<absolute-project-path>/exports/<name>-${ts}.csv`
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('export-csv-btn').click()
  await (await downloadPromise).saveAs(path)
  return path
}
```

Invoke via `browser_run_code_unsafe`. **The "unsafe" label is misleading here** — you're writing the code yourself, not passing through user input. Avoiding `_unsafe` because of the name means losing download capture entirely, which kills the demo's hero feature.

The MCP also retains a duplicate copy at `.playwright-mcp/<filename>` — that's its scratch space, gitignored, harmless, ignore it.

## `file://` URLs are blocked

Playwright MCP refuses `file:///path/to/page.html` for security. Two workarounds:

1. **If a Vite dev server is running** (DemoCorp's default state during a demo): navigate to `http://localhost:5173/path/to/page.html` instead. Vite serves arbitrary files under the project root. Cleanest path — you can still `browser_snapshot` afterward.
2. **Otherwise**: shell out to `open <path>` (macOS), `xdg-open <path>` (Linux), or `start <path>` (Windows). Launches the user's *default* browser, outside of Playwright. You can't snapshot it, but the user sees the result.

## Console errors

After every page transition that matters:

```
browser_console_messages level="error"
```

Cosmetic noise (e.g. `favicon.ico 404`) is fine to ignore. Real JS errors — `TypeError`, `ReferenceError`, network failures on critical XHRs — should make you stop and debug, not continue the script.

## Waiting

| Want | Use |
|---|---|
| Wait for the dev server | shell `until curl -fsS http://localhost:5173/ >/dev/null; do sleep 0.5; done` (with a timeout) |
| Wait for text to appear in-page | `browser_wait_for text="..."` |
| Wait for text to disappear | `browser_wait_for textGone="..."` |
| Wait a fixed time | `browser_wait_for time=2` (only when you have nothing observable to wait on) |

Avoid `sleep` in shell — it's rigid; if the thing finishes faster you waste time, if slower you fail.
