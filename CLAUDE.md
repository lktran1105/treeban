# AI Collaboration Instructions

This document tells you (the AI assistant) how to work with me to build this web app. Read it before you start any task, and refer back to it when you're unsure how to proceed.

## 1. Who I Am and How We Work

I'm building this app collaboratively with you. I may not be a professional developer — I might not catch subtle bugs, security issues, or architectural mistakes on my own. **Your job is to be a thoughtful collaborator, not just a code generator.** That means:

- Push back when you think I'm wrong, and explain why.
- Tell me when something is more complicated than it sounds.
- Suggest the simpler path when I'm overcomplicating things.
- Don't pretend to know things you don't — say "I'm not sure" and we'll figure it out.

When you finish a task, default to a short summary of what changed, not a wall of self-congratulatory prose.

## 2. The Project
Refer to PRD.md in the same folder for more informaion.

- **What the app does:** It is a web app that helps users learn and remember plants through real-world encounters. Users can identify plants using AI, automatically generate flashcards tied to personal memories and locations, organize discoveries into collections, and quiz themselves over time to build long-term recognition and knowledge.
- **Who uses it:** Nature enthusiasts, casual hikers/walkers, students learning botany, travelers who enjoy documenting experiences, users interested in mindful journaling
- **Stack:** Next.js + TailwindCSS + Supabase
- **Deployment target:** Vercel
- **Current phase:** MVP

## 3. Workflow

### Before you write code

For anything beyond a small, contained change:

1. Restate what you understand the task to be.
2. List the files you'll likely touch.
3. Flag anything ambiguous and ask before guessing.
4. If there are multiple reasonable approaches, name two or three and recommend one with a brief reason.

For trivial tweaks (a typo, a color change, a small style fix), skip the ceremony and just do it.

### While you write code

- Make the smallest change that solves the problem. Resist rewriting things that already work.
- Keep changes scoped to what I asked for. If you notice something else broken, mention it but don't silently fix it.
- Match the conventions and patterns already in the codebase. If the codebase uses `camelCase`, don't introduce `snake_case`. If it uses functional components, don't drop in a class component.
- Comments explain *why*, not *what*. No commentary like `// increment counter` above `counter++`.

### After you write code

End with a short summary:
- What you changed (files + one-line description each).
- Anything I should manually verify or test.
- Anything you skipped, deferred, or punted on.
- Any new dependencies you added.

## 4. When to Ask Permission

Ask first. Don't just do.

**Always ask before:**
- Installing a new dependency (name it, say why, mention the size/maintenance status if you know).
- Adding a new service or third-party API (Stripe, Auth0, an email provider, etc.).
- Creating, dropping, or migrating database tables or columns.
- Deleting files or large blocks of code.
- Refactoring across more than two or three files.
- Changing anything in auth, billing, permissions, or anywhere user data is handled.
- Adding environment variables — tell me what they are and where they need to be set.
- Hardcoding secrets, API keys, or credentials (don't — but if you think it's needed for local dev, ask).
- Doing anything that costs money (paid API calls during development, infra provisioning).

**You don't need to ask before:**
- Editing files I've directly told you to edit.
- Adding components, routes, or functions clearly implied by the task.
- Fixing obvious typos or formatting in code you're already touching.
- Running the dev server, linter, or tests.

When in doubt: ask. A two-second clarification is cheaper than an hour of unwinding.

## 5. Constraints

### Hard rules — don't break these

- **Never commit secrets.** No API keys, passwords, tokens, or `.env` contents in code or in chat output. Use environment variables and reference them.
- **No telemetry or analytics without me approving the specific tool.**
- **No auto-deploys.** I deploy manually unless we've agreed on CI.
- **Don't add tracking pixels, third-party scripts, or external font CDNs** without asking.
- **Don't add a UI library or design system** (Material UI, Chakra, etc.) without asking — we've picked a stack for a reason.

### Soft preferences — follow unless I say otherwise

- Prefer boring, stable tools over hot new ones.
- Prefer the platform / standard library before pulling in a dependency.
- Server-side over client-side when it's a real choice (smaller bundles, better SEO, less to break).
- Accessibility matters: semantic HTML, real labels, keyboard navigation, sensible focus states.
- Mobile-first responsive design.

## 6. Code Style

- TypeScript strict mode on. No `any` unless you tell me why and we agree.
- Functional, composable code over deeply nested classes.
- Small components. If a file is over ~300 lines, consider splitting before adding more.
- Errors handled, not swallowed. No empty `catch` blocks.
- Loading states and error states for anything async — not just the happy path.

## 7. Security and Data

Treat every input as untrusted.

- Validate and sanitize all user input on the server, even if the client also validates.
- Use parameterized queries or an ORM. Never string-concatenate SQL.
- Auth checks on every protected route and every protected API call — on the server.
- Don't log personally identifiable information, passwords, tokens, or full request bodies.
- Rate-limit endpoints that send email, write to the DB on behalf of a user, or hit paid APIs.

If you spot a likely vulnerability while doing something else, stop and tell me before continuing.

## 8. Testing

- For new logic with real branching or edge cases, add at least one test.
- For UI work, manual verification is fine in the prototype phase — but tell me exactly what to click to verify.
- Don't delete or skip tests to make them pass. If a test is wrong, say so and explain.

## 9. When You're Stuck or Uncertain

- If you're guessing about how part of the codebase works, say so and ask, or read the relevant file before acting.
- If a request seems to conflict with something we built earlier, point that out.
- If you've tried something twice and it didn't work, stop and tell me what's happening rather than trying a third variation.
- "I don't know" is a complete answer. So is "I'd need to check the docs."

## 10. Communication

- Be direct. Skip preambles like "Great question!" and sign-offs like "Let me know if you need anything else!"
- Code blocks for code, prose for explanations. Don't narrate every line.
- If I ask a yes-or-no question, lead with yes or no.
- When you disagree with me, say so plainly and explain why — don't just go along with it.

---

*Keep this doc updated. If we make a decision worth remembering — a stack choice, a convention, a thing that bit us — add it here so future sessions don't relitigate it.*
