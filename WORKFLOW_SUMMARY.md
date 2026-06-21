# Building Treeban — A Workflow Retrospective

*A look back at how this plant-identifier app ("Treeban") was built collaboratively with
Claude Code over ~3 weeks (May 22 – Jun 8, 2026), reconstructed from the 7 conversations of
the build. Organized by theme, with selected quotes from both sides.*

> **Why "Treeban"?** As the user put it in the LinkedIn post drafted at the end:
> *"This inspires me to build 'Treeban' (ban means 'friends' in Vietnamese!)."* — your plant friend.

## Timeline

| # | Date | Focus |
|---|------|-------|
| 1 | May 22–29 | Doc review, project scaffolding, repo/Vercel setup, **Milestone 1–2** (auth) |
| 2 | May 31–Jun 1 | **Milestone 3–6** (plant ID, flashcards, timeline, quiz) + camera viewfinder |
| 3 | Jun 3 | iOS camera black-screen fix; mock-vs-real API on Vercel |
| 4 | Jun 3–4 | Frontend redesign (lush background, fonts) + how-to-collaborate decision |
| 5 | Jun 5 | Common-name support (DB migration) |
| 6 | Jun 5 | Scrollable/expandable timeline, flashcard page, Playfair Display font |
| 7 | Jun 5–8 | Real-usage prep: kill mock, clear data, rate limiting, security review |

---

## 1. How the idea / problem originated

The project didn't start from a blank prompt — the user arrived with three planning docs
(`CLAUDE.md`, `MILESTONE.md`, `PRD.md`) already written, and opened by asking Claude to
pressure-test them before any code:

> **User:** *"here are the files that I have to build a new project. Take a look at it and
> ask me any questions that you have about these files and if all of them make sense."*

Claude's first act was to **find conflicts in the spec rather than start coding** — a tone
that held for the whole project:

> **Claude:** *"One real conflict: Milestone 1 says 'Confirm deployment pipeline works (push
> to GitHub → auto deploys)' but CLAUDE.md has a hard rule: 'No auto-deploys.' These directly
> contradict. Do you want auto-deploy on push, or manual Vercel deploys?"*

The deeper personal motivation only surfaced explicitly at the very end, when the user drafted
a launch post — and it reframes the whole build:

> **User:** *"Have you ever identified a plant, and then just forgets about it? I live in a
> beautiful neighborhood, and I really want to be able to point them out with their name."*

---

## 2. Iterations over time

The build ran in two distinct gears: a **milestone march** to get the MVP working, then
**feature-by-feature refinement** once it was real.

**Phase A — Milestones (1→6).** Auth, then plant identification, flashcards, timeline, and a
spaced-repetition quiz, each closed out only after the user manually tested it:

> **User:** *"nice! tested milestone 6 and it looks good! can mark done in markdown.md"*
>
> **Claude:** *"All 6 milestones done — that's the full MVP. You have a working plant
> identification app with auth, camera capture, AI identification, flashcard creation,
> timeline, and spaced repetition quiz."*

**Phase B — Refinement.** The camera feature is the clearest example of iterating on the same
surface three times: from a clunky native file-capture, to a live in-browser viewfinder, to an
iOS fix. The user kept extending scope with concrete product asks:

> **User:** *"Right now the user has to upload an image. I want the user to be able to use
> their camera to point towards a specific plan, capture a photo, and then use that photo to
> identify... What is the game plan for this feature?"*

> **User:** *"I want to create a flashcard page so users can see all the flashcards they
> created... Each flashcard has 2 sides. First side is the photo of the plant, and the back
> side is the names... and notes. The user clicks on the card to switch from front to back."*

A notable **process decision** shaped how design iterations happened — the user asked whether
to use Figma, and Claude steered toward staying in-repo:

> **User:** *"Should I draft some design details on a different platform like Figma?... The
> second option is that I make a new markdown here and then write out what I want and let you
> design. What would work best[?]"*
>
> **Claude:** *"Go with the markdown file... When you share a Figma link, I can't open it...
> The best combo is actually: write the markdown for behavior/requirements, and paste
> screenshots or exported frames from Figma directly into our conversation."*

The final iterations turned from features toward **going live** — removing mock data, clearing
test records, and gating usage:

> **User:** *"I think let's implement the rate limiting on the identify endpoint. Right now, I
> want each user to only be able to do two identifications in the span of 24 hours."*

---

## 3. Difficulties encountered

This is where most of the real time went. The recurring theme: **the code was usually fine —
the environment (git, Supabase, Vercel, the external API) was the hard part.**

**The wrong repo.** The very first deploy pushed an entirely different old project, because
git had been initialized at the home-folder level:

> **User:** *"it seems that it uploads my old project 'AI image guard' into the new repo for
> project Treeban."*
>
> **Claude:** *"The git repository is rooted at `/Users/linhtran` (your entire home folder),
> not inside `plant-identifier`. So when you pushed, git sent the history of that parent
> repo... Your new plant-identifier files were never committed to any git repo."*

**The "invalid API key" saga** spanned dev-server staleness, a `middleware.ts → proxy.ts`
rename in Next.js 16, local-`.env`-vs-Vercel confusion, and — the actual root cause —
Supabase having rotated its key format mid-project:

> **Claude:** *"Vercel env vars have no effect on your local dev server. When you run
> `npm run dev`, Next.js reads from your local `.env` file, not from Vercel."*
>
> **User (resolved):** *"I updated the .env file with the new keys. I got to sign up, logged
> in, and see my name on the supabase database."*

**Supabase RLS / Data API.** Saving an identification failed with a database permission error
that turned out to be a dashboard toggle, not code:

> **User:** *"here is the error: DB insert error: permission denied for table
> plant_identifications. The API is disabled for the plant_identifications table in Supabase"*

**The iOS camera black screen** — a genuine front-end timing bug:

> **User:** *"When I say 'allow camera,' it doesn't show anything on the screen however, I know
> that the camera is working because I can see my hands."*
>
> **Claude:** *"The `requestAnimationFrame` callback runs before React has finished rendering
> the `<video>` element into the DOM... the stream is never assigned to the video element."*

**The Plant.id 400.** The single most drawn-out difficulty — getting common names out of the
external API (see §4 for how it was actually solved).

---

## 4. Where Claude got it wrong

**The big one: the Plant.id `details` field.** When real API calls started returning `400`,
Claude diagnosed the symptom correctly but then **guessed at the fix twice and was wrong both
times.** First it guessed the wrong request shape:

> **Claude:** *"Plant.id v3 might expect `\"classification\": [\"common_names\"]` or a
> different structure for details."*

Then, after the real error came back, Claude over-corrected into a flatly **incorrect
conclusion** — that common names couldn't be fetched at all — and proposed abandoning the
feature or bolting on a second API:

> **Claude:** *"Common names aren't available as a modifier at all, so we need to drop that and
> fetch common names a different way (or just use the scientific name for now)."*
>
> **Claude:** *"The free alternatives would be: GBIF API... Wikipedia API... Just drop common
> names... What do you want to do?"*

**Smaller self-inflicted mistakes** (which Claude did catch on its own) are worth noting as a
pattern — scaffolding and edits that needed immediate cleanup:

> **Claude:** *"The rsync overwrote `CLAUDE.md` with a template version. Let me fix that
> immediately."*
>
> **Claude:** *"I introduced an extra unclosed `<div>`. Let me fix the closing tags."*

---

## 5. How the user caught it & fixed it

The user's most valuable move throughout was **pasting exact errors, logs, and screenshots**
rather than vague descriptions — which is what let Claude move from guessing to knowing. The
turning point on the Plant.id bug came when the user pushed Claude to **stop guessing from
docs and log the real response body**, then read the API documentation themselves and
**directly overruled Claude's "not available" conclusion**:

> **User:** *"so, from the API documentation, the error message in the 400 response body means
> that invalid input data. How do we know what valid input data looks like?"*
>
> **User (pushing back):** *"just for clarification, we cannot fetch common names from the
> plant.id API?"*
>
> **User (with the answer):** *"okay, so I see this in plant.id API documentation... within
> details, we can ask for common names. Can we call the common names from details?"*
>
> **Claude (finally correct):** *"The docs say details go in **GET parameters** (the URL), not
> the POST body. That's why it failed — we put it in the wrong place... append
> `?details=common_names` to the URL."*

The same instinct caught the mock-vs-real confusion — a single sharp question from the user
unlocked Claude's diagnosis that local and production were running different code paths:

> **User:** *"are we not using the mocks and fixtures and not really calling API right now?"*
>
> **Claude:** *"`USE_MOCK=true` is set in your `.env` file, so locally the app uses mock data
> and never calls the Plant.id API. But Vercel doesn't have this file... This is why it fails
> on your phone (production) but would work locally (mock)."*

And the user consistently **owned the parts only they could do** — running SQL migrations,
flipping Supabase toggles, setting Vercel env vars — while asking Claude to verify the
reasoning, e.g. confirming the storage bucket policy from a screenshot before trusting it.

---

## Closing reflection — patterns across the journey

- **Spec-first, milestone-driven.** Three planning docs up front and a strict
  "test-before-marking-done" cadence kept scope tight and the MVP coherent.
- **The hard parts were rarely the code.** Git topology, Supabase RLS/Data-API toggles, key
  rotation, and Vercel-vs-local env mismatches caused more pain than any feature.
- **Claude was strongest at diagnosis, weakest when guessing at external-API contracts.** The
  one place it confidently asserted something false (common names "not available") was resolved
  only when the user brought the actual documentation.
- **The collaboration worked because the user supplied ground truth** — exact errors, logs,
  screenshots, and a willingness to push back — instead of accepting the first plausible answer.
- **Governance held:** Claude paused for permission before DB migrations and deletions, per the
  rules in `CLAUDE.md`, throughout.
