# Bring Your Own Site

## Description
The agent contract for operating any website the user points you at. This is about *how to behave* (security rules, user-handles-login pattern, training mode), not *how to press buttons* (that's [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md)).

## Trigger
"go to [url]", "open [website]", "do [task] on [site]", "let's explore [site]", "help me with my [tool]", "teach you how to use [tool]".

## Workflow

### 1. Open the site
1. `browser_navigate` to the URL the user provided.
2. `browser_snapshot` to read the page (see [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md) for snapshot mechanics).
3. If you see a login form or auth wall:
   - Say: *"I've opened [site]. Please log in — I'll wait. When you're done, tell me 'in' or 'logged in.'"*
   - Do NOT enter credentials. Do NOT click "Continue with Google" or any other SSO button.
   - Wait for the user.

### 2. Understand the page
4. After the user signals they're in (or if no auth was needed), `browser_snapshot` again.
5. Tell the user what you see in 2–3 sentences. Mention:
   - The kind of page (dashboard, list, form, settings, etc.)
   - Visible navigation
   - Anything that looks read-only vs interactive

### 3. Do the work
6. The user gives you a task. Map it to one of these patterns:
   - **Read-only task** ("summarize," "find all X," "tell me what's here") → navigate, snapshot, read, report. Always safe, don't ask permission.
   - **Single write** ("submit this form," "approve order 123") → confirm before clicking: *"I'm about to click [exact button] which will [exact effect]. Proceed?"* Wait for yes.
   - **Bulk write** ("approve all under $1000") → confirm scope first: *"I see N matching items. I'll approve them one by one. Should I do all N, or pause after each?"*
   - **Destructive** (Delete, Archive, Revoke, Transfer, Cancel) → per-action confirmation, every time. *"This would permanently delete [X]. Are you sure?"*

### 4. Downloads
If the task involves downloading data (CSV, PDF, image, export):
- Save the file to `./exports/` in the current project, **not** `~/Downloads`.
- Use the download-capture pattern in [`../playwright-mcp/SKILL.md`](../playwright-mcp/SKILL.md#downloads--capture-to-the-project-directory).
- **Fallback** if your MCP doesn't expose download capture: inspect the page (`browser_snapshot` or read the DOM via `browser_evaluate`) to find the download URL, then `curl -o ./exports/<filename> <url>`. You lose the "user pressed the real button" narration but the data still lands in the right place.

### 5. Reporting back + engaging
After any work, summarize:
- What you read or did
- What changed (if anything)
- What's still pending (if anything)

Then — per the **Engagement principle** in `AGENTS.md` — don't stop at the summary. Ask one follow-up question. Pick whichever fits:

- If you just *read/summarized* a page: *"Want me to do something on this page, or move to a different one?"*
- If you just made a *single write*: *"Did that look right? Want me to do similar for [the next item], or stop here?"*
- If you just finished a *bulk task*: *"That's N out of M done. Want me to keep going, switch to a different filter, or call it?"*
- If they pointed you at a *new site you don't know*: *"This is the first time I've worked with [site]. Want to teach me one of your common workflows now so I can run it on autopilot next time? (See the training-mode section below.)"*

If your platform exposes a structured-question tool, use it to offer 2–3 specific branches. Always accept open input — they might type something off-menu and that's usually the most useful answer.

One question at a time. Wait for the answer.

## Training mode — teaching the agent a new site

When the user says "let's explore [site]" or "teach you how to use [tool]":

1. Open the site, let them log in
2. `browser_snapshot` and describe the layout
3. Ask them to walk you through ONE concrete workflow ("show me how you'd create a new vendor")
4. As they narrate, note each step and the selector/landmark you'd use
5. After the walkthrough, write a new SKILL.md to `.devin/skills/<site-slug>/SKILL.md` — **copy [`../democorp/SKILL.md`](../democorp/SKILL.md) as the template and replace each section with the workflow you just learned**
6. Test it: run through the same workflow using only your new skill — adjust whatever steps are missing or wrong

## Hard rules (security)

These are non-negotiable:

- **Never enter credentials for external sites.** Even if the user says it's fine, even if the password is on screen, even if it's "just a test account." DemoCorp (this repo's bundled sandbox) is the only exception.
- **Read-only by default.** Reading, navigating, scrolling, hovering — always safe, no confirmation needed.
- **Ask before every write.** Single sentence, naming the button and its effect.
- **Never explore admin / settings / billing / API-keys pages** unless explicitly directed there.
- **Stop and ask if you see what looks like another user's data** in a multi-tenant app. You may have been logged into the wrong account.
- **Surface destructive-looking labels even if you didn't click them**: *"I see a 'Revoke API Key' button on this page — flagging it so you know it's there. Want me to avoid that section entirely?"*

When in doubt, ask. The cost of pausing is a few seconds; the cost of an unwanted action can be hours or days.
