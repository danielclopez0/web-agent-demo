# Bring Your Own Site

## Description
Operate any website the user points you at. The user handles login (you never see credentials); you read the page structure, follow their instructions, and ask before any write action.

## Trigger
"go to [url]", "open [website]", "do [task] on [site]", "let's explore [site]", "help me with my [tool]".

## Workflow

### 1. Open the site
1. `browser_navigate` to the URL the user provided.
2. `browser_snapshot` to read the page.
3. If you see a login form or auth wall:
   - Say: *"I've opened [site]. Please log in — I'll wait. When you're done, tell me 'in' or 'logged in.'"*
   - Do NOT enter credentials. Do NOT click "Continue with Google" etc.
   - Wait for the user.

### 2. Understand the page
4. After the user signals they're in (or if no auth was needed), `browser_snapshot` again.
5. Tell the user what you see in 2-3 sentences. Mention:
   - The kind of page it is (dashboard, list, form, etc.)
   - Visible navigation
   - Anything that looks read-only vs interactive

### 3. Do the work
6. The user gives you a task. Map it to one of these patterns:
   - **Read-only task** ("summarize", "find all X", "tell me what's here") → navigate, snapshot, read, report. Always safe.
   - **Single write** ("submit this form", "approve order 123") → confirm before clicking: *"I'm about to click [exact button] which will [exact effect]. Proceed?"* Wait for yes.
   - **Bulk write** ("approve all under $1000") → confirm count first: *"I see N matching items. I'll approve them one by one. Should I do all N, or pause after each?"*
   - **Destructive** (Delete, Archive, Revoke, Transfer) → never proceed without explicit per-action confirmation. *"This would permanently delete [X]. Are you sure?"*

### 4. Downloads
If the task involves downloading data (CSV, PDF, export):
- Save the file to `./exports/` in the current project, not `~/Downloads`.
- **Primary path** — Playwright download event. With `@nichochar/playwright-mcp` + a `run_code_unsafe`-style tool:

  ```js
  async (page) => {
    const path = `<absolute-project-path>/exports/<filename>`
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '<Export button name>' }).click()
    await (await downloadPromise).saveAs(path)
    return path
  }
  ```

- **Fallback** — if your MCP doesn't expose downloads, inspect the page (`browser_snapshot` or DOM read) to find the download URL, then `curl -o ./exports/<filename> <url>` directly. You lose the "user pressed the real button" narration but the data still lands in the right place.

### 5. Reporting back
After any work, summarize:
- What you read or did
- What changed (if anything)
- What's still pending (if anything)

## Training mode — teaching the agent a new site

When the user says "let's explore [site]" or "teach you how to use [tool]":
1. Open the site, let them log in
2. `browser_snapshot` and describe the layout
3. Ask them to walk you through ONE concrete workflow ("show me how you'd create a new vendor")
4. As they narrate, note each step and the selector/landmark you'd use
5. After the walkthrough, write a new SKILL.md to `.devin/skills/<site-name>/SKILL.md` capturing the workflow
6. Test it: run through the same workflow using only your new skill — adjust as needed

## Hard rules (security)
- Never enter credentials for external sites
- Read-only by default
- Ask before every write
- Never explore admin/settings/billing pages unless explicitly directed
- If you see anything that looks like another user's data (in a multi-tenant app), stop and ask
