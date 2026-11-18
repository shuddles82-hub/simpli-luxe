# CLAUDE.md: Simpli Luxe Web and Mobile App

This file lives inside the app repo so Claude Code loads it when working here. It replaces the older copy in `../starter-kit/CLAUDE.md`.

## What this project is

Simpli Luxe is a lifestyle web application (installable as a PWA) for millennial women, built on the philosophy "Luxury Doesn't Have to Be Expensive." Founded by Staci D. Huddleston. The app is a digital magazine, planner, AI lifestyle assistant, and Luxe Insider membership. Live at simpliluxe.com. Pushing to `main` deploys.

## Reference documents

These sit one folder up, outside this repo, in `../starter-kit/`:

- `airtable_schema.md`: field-level schema and the API filtering logic. Treat as the source of truth for content types, then confirm against the live base.
- `design_tokens.md`: colors, typography, spacing, image specs by table.
- `build_plan.md`: the original phased build plan and its completion status.

In this repo:

- `README.md`: setup steps in plain language for Staci.
- `model-audit-log.md`: what each new-model audit found, fixed, and left open. Read it before auditing.
- `docs/simpli-luxe-concierge.md`, `docs/simpli-luxe-link-desk.md`, `docs/simpli-luxe-pr-desk.md`: Staci's Simpli Luxe Concierge, a separate morning back office that runs as a scheduled task and a private page. Not part of the app and not deployed.
- `tools/reel/make_reel.py`: Footage to Reel, a local ffmpeg script for branded 9:16 rough cuts. Not part of the app.

Never commit income figures, collab rates or contract terms to this repo. Those live in Airtable and on the private Concierge page.

## Stack (decided, do not substitute)

Next.js (App Router), plain CSS using design tokens (no Tailwind, no component libraries). Hosting: Vercel. Content: Airtable, read on the server only. Auth and user data: Supabase, email and password as the primary sign-in (with an optional emailed sign-in link) and row-level security. Payments: Stripe (live mode). AI: Anthropic API (`claude-opus-5-5` for SimpliBot, falling back to `claude-opus-4-8` if the newer model declines a request). Email list: Kit (ConvertKit). Mobile: PWA (built); a native wrapper only if traction ever justifies it.

The Supabase project is on the free plan, which pauses after about a week without activity and takes every member feature offline. `/api/cron/keep-alive` runs daily to prevent that. If sign-in or email suddenly fails for everyone, check whether the project is paused before looking at code.

## Hard rules

1. **Never put the Airtable token (or any secret) in client-side code.** All Airtable access goes through `lib/airtable.js`, called only on the server.
2. **Never use em dashes anywhere:** user-facing copy, placeholder text, generated content, code comments, or docs. `/api/simplibot` runs a punctuation sanitizer as a backstop; do not rely on it.
3. **Banned words in UI copy:** hustle, grind, crush it, girlboss, manifest, 10x, level up, game-changer, secret sauce, unlock, leverage (as a verb). Tone is warm, calm, elevated. No urgency mechanics, no streak-shaming.
4. **One content source pattern: every live series reads from its own dedicated Airtable table**, never from Content Queue.
   - Content Queue is a staging inbox only. Staci's Make.com pipeline drops AI drafts there with a `Destination Table` and a `Review Status`. The app never reads it.
   - An approved draft is promoted into the matching table by hand, or by a one-off CSV import. Only records in the dedicated table with `Status = 'Published'` are visible.
   - Table and field names drift from the schema doc (for example "Luxe Life Lesson" singular). Confirm names against the live base before writing a fetcher.
5. **Trim whitespace when matching Status.** Every filter uses `TRIM({Status})='Published'`. A trailing space in a select value otherwise makes a record vanish with no error.
6. **Scheduled publishing is opt-in per table.** A `Publish Date` field keeps a record hidden until that moment. Wired up for Insider Weekly only. `fetchRecords()` takes a `fallbackFilterFormula` because a table may not have the field yet. Follow that pattern before adding scheduling elsewhere.
7. **Premium (Insider) gating exists on three series: The Simpli Sip, Luxe Life Lessons, and Insider Weekly.** Each has a `Premium` checkbox.
   - Anything a server page passes to a client component is serialized into the page and readable by anyone. So pages must pass only the teaser for premium items: use `insiderTeaser`, `lessonTeaser`, `sipTeaser` from `lib/content.js`.
   - The full item is sent only by `/api/sips/[id]`, `/api/lessons/[id]`, `/api/insider/[id]`, after checking `profiles.is_insider` with the service-role client.
   - Do not add public list routes that return whole items. The November 2026 audit found `/api/insider` returning every premium body to anyone; those list routes were deleted.
8. **Sharing must never leak gated content.** `components/ShareRow.js` takes a `premium` flag; shared text for premium items is only the free preview plus a "Read the rest with Luxe Insider" line.
9. **Match the existing design.** Fonts: Cormorant Garamond (display), Jost (UI and body), Dancing Script (accents).
10. **Mobile-first.** Test at 375px width first. The site is also an installed PWA. In local development a stale service-worker cache can mask a real code change (it shows up as a hydration mismatch). Unregister the service worker and clear caches if a change will not show.
11. **Routes that add people to the email list or send email must be tied to a signed-in member or a secret.** `/api/kit/subscribe` uses the email on the member's own account, never one sent in the request.

## Content series and their sources

| Series | Table (candidate names) | Premium gate | Notes |
|---|---|---|---|
| The Luxe Code | `Luxe Code` / `The Luxe Code` | No | Flagship weekly series. Own `Cover Image` and `Formula Card Image` fields |
| Soft Life Shift | `Soft Life Shift` | No | Holds Shift Cards and Notes to Self, split by `Type` |
| Luxe Life Lessons | `Luxe Life Lessons` / `Luxe Life Lesson` | Yes | |
| The Simpli Sip | `The Simpli Sip` / `Simpli Sip` | Yes | |
| The Simpli Edit | `The Simpli Edit` | No | One row per issue. Issues also exist as full HTML magazines in `public/`, wired up in `lib/editHtml.js` |
| Simpli Styled | `Simpli Styled` | No | No per-item page; cards render in the `/styled` feed |
| Shop Collections | `Shop Collections` | No | `Featured=1` powers the homepage spotlight |
| Life's Little Luxuries | `Life's Little Luxuries` / `Little Luxuries` | No | One field may hold several photos or a short video |
| Insider Weekly | `Insider Weekly` | Yes | `Pillar` select: Daily Affirmation, Sunday Reset, Money Monday, Wellness Wednesday, Weekend Luxury Guide |

## Project conventions

- App routes: `/`, `/luxe-code`, `/luxe-code/[id]`, `/luxuries`, `/edit`, `/edit/[id]`, `/styled`, `/shift`, `/shift/[id]`, `/shift/notes`, `/lessons`, `/lessons/[id]`, `/sip`, `/sip/[id]`, `/premium`, `/shop`, `/planner`, `/simplibot`, `/insider`, `/insider/[id]`, `/library`, `/account`, `/account/reset`
- API routes: `/api/sips/[id]`, `/api/lessons/[id]`, `/api/insider/[id]`, `/api/simplibot`, `/api/library`, `/api/library/download`, `/api/stripe/{checkout,webhook,portal,sync,price}`, `/api/kit/{subscribe,preferences,notify-content}`, `/api/cron/{retrigger-reminders,keep-alive}`
- Pages call `lib/content.js` (`get*Content()`), the live-or-fallback layer. Never call `lib/airtable.js` fetchers directly from a page; that skips the built-in fallback content.
- `lib/airtable.js` follows Airtable paging, so tables past 100 records are read in full.
- Components in `/components`, one file per card or gate type. `*DetailGate.js` components fetch premium content after mount.
- Environment variables are documented in `.env.example`. Real values live only in `.env.local` (ignored by git) and Vercel. `STRIPE_WEBHOOK_SECRET` is in Vercel only, so the webhook answers "not configured" locally.
- Kit tags the code depends on: `App Member`, `Notify: New Content`, `Content Alert - Fire`, `Soft Life Reminders - Opt In`.

## Workflow expectations

- Staci is a founder, not a developer. Explain setup in plain language with exact click paths, and confirm which Airtable fields she needs to add before a feature depends on them.
- Prefer boring, maintainable code over clever code. Verify against the real live data before assuming a change is correct. Several real bugs here only showed up against her actual records or the live site.
- Work on a branch and give her the merge commands. Do not give a "back out" command as a runnable block alongside them.
- Always ask before deleting a file or touching payments, pricing, logins, or anything that sends messages to people.
- At the end of a change, say what was built, how it was checked, what was not checked, and what she needs to do next.
