# Model Audit Log

## 2026-11-16, Claude Fable 5.2 (claude-fable-5-2)

Branch: `model-audit-2026-11-16`. First audit, so there was no earlier log to compare against.

### What was read

Every tracked file in this repo except `package-lock.json`, plus `.env.example`, the variable names (not values) in `.env.local`, the Claude memory files, `../.claude/launch.json`, `../.claude/settings.local.json`, and `../starter-kit/CLAUDE.md` and `build_plan.md`.

Not read line by line: `app/globals.css` (checked by script for unused and undefined classes only), `node_modules`, the Word and PDF documents in the outer folder, `../starter-kit/airtable_schema.md` and `design_tokens.md`.

Checks run: `npm run build` (passes), a search for em dashes, a search for unused components and routes, and a read-only check of three public list endpoints on the live site. There is no test suite and no lint script. Signed-in flows were not exercised.

### Fixed (comments and docs only, nothing customers see)

1. Em dashes removed from code comments: `app/api/kit/notify-content/route.js`, `components/LuxeCodeExplorer.js`, `lib/airtable.js` (two), `supabase/library.sql`, `lib/fallback.js` (also corrected "Vol 01 to 06" to "Vol 01 to 07"). Checked by re-running the em dash search.
2. `.env.example`: added the three variables the code needs but the file did not list (`KIT_API_KEY`, `CONTENT_ALERT_WEBHOOK_SECRET`, `CRON_SECRET`), and removed the line saying the service_role key never goes in this project, which contradicted the `SUPABASE_SERVICE_ROLE_KEY` line below it. Checked against the names in `.env.local` and the code.
3. `README.md`: same service_role contradiction fixed, sign-in described as email and password with an optional link, the three missing variables added to the Vercel list, and Luxe Code, Life's Little Luxuries and Insider Weekly added to the content table. Checked by rereading against `lib/airtable.js` and `AccountPanel.js`.
4. `lib/supabase-admin.js`: comment said it is used only by Stripe checkout and the webhook. It is used by nine routes. Comment updated.
5. `components/EditCover.js`: removed a replace call that replaced "The " with "The " (no effect). Output is identical. Checked by build.

### Waiting on Staci (riskiest first)

1. **Insider content is public.** `/api/insider` returns the full body of every premium Insider Weekly item to anyone. Confirmed on the live site: 17 of 17 premium items came back with their body. The `/insider` page and the three detail pages also send the full premium item to the browser inside the page data, and `InsiderCard` shows the premium quote or excerpt on the card. Premium Sips and Lessons have the same pattern but none are marked Premium today. Suggested: strip premium fields in the list data and before anything is passed to a client component.
2. **Nine list routes nothing uses.** `/api/shift`, `lessons`, `sips`, `edit`, `styled`, `shop`, `luxuries`, `luxe-code`, `insider`. No page or component calls them. Suggested: delete them (file deletion, needs approval). This closes the most direct part of item 1.
3. **`/api/kit/subscribe` has no sign-in check.** Anyone can add any email address to the Kit list as an App Member. Suggested: require the member's session and use the email from that session.
4. **Content alert secret.** The real `CONTENT_ALERT_WEBHOOK_SECRET` value sits in plain text in `../.claude/settings.local.json` (a saved curl permission), and the route takes it as `?secret=` in the URL, where it lands in logs. Suggested: rotate it, remove that permission line, accept it as a header.
5. **Stripe webhook** (`app/api/stripe/webhook/route.js`). Every `customer.subscription.updated` event resets `insider_since` to now, so the "since" date moves on each renewal. Database errors are swallowed and Stripe is told it worked. Suggested: only set `insider_since` when it is empty, and return a 500 on a database error so Stripe retries.
6. **Kit calls never check for failure** (`lib/kit.js`). `setKitTag` returns true even when Kit rejects the call, so the weekly cron records a reminder restart that did not happen, and the preferences route reports success when the tag did not change. Suggested: check `res.ok`.
7. **100 record ceiling** (`lib/airtable.js`). Insider Weekly, Life's Little Luxuries, Simpli Styled and Shop fetch the first 100 records in no set order and sort afterwards. Past 100 records the newest ones can go missing. Suggested: sort in the Airtable request or page through results.
8. **SimpliBot daily limit** (`app/api/simplibot/route.js`). The count is stored in rows the member is allowed to delete, the day rolls over on server time and not hers, and a failed reply still uses a moment. It also re-implements the sign-in check that `lib/auth-server.js` already provides. The model is `claude-opus-4-8`; newer models exist, and changing it affects cost and voice, so that is her call.
9. **Library downloads** (`app/api/library/download/route.js`). The download name is the item title with no file extension, so a PDF may save without `.pdf`. Not confirmed, needs a signed-in test.
10. **Stale wording customers see.** Homepage says "Now in The Expansion Era · Q3 2026" (it is Q4). Planner, SimpliBot and Library sign-in notes say "no password needed". The Insider upsell list does not mention the Insider Hub and says the Library is still opening. "New content twice a month" sits beside weekly and daily pillars. The planner tells members to read "the README". "All 7 Vols" is typed in by hand in two places.
11. **Three em dashes in customer copy.** `components/AccountPanel.js:466`, `components/InsiderDropsWidget.js:51`, `components/SimpliBotPanel.js:231`.
12. **Dead code.** `components/SipModal.js` is not used anywhere (deletion needs approval). About 14 CSS classes are unused: `pgrid`, `pinc`, `pinc-n`, `pinc-t`, `pinc-d`, `pform`, `pinp`, `pbtn`, `pnote`, `pbadge`, `siph-img`, `bm2m`, `bath`, `cbg4`.
13. **Repeated code.** Three near identical DetailGate components and three near identical `[id]` routes. The photo carousel is copied in `LuxuryCard.js` and `FormulaCardMedia.js`. `BodyParagraphs` exists four times.
14. **Instruction files outside this repo.** `../starter-kit/CLAUDE.md` is in a subfolder, so Claude Code does not load it automatically. Its route lists are out of date (no Luxe Code, Kit preferences, notify-content, or cron) and its rule 7 says premium content is redacted, which item 1 shows is not true. The starter-kit docs contain 56 em dashes. The Claude memory file still gives the live address as simpli-luxe.vercel.app and says both "no password exists or is planned" and "password auth replaces magic link". README has no setup section for email notifications (`notification-prefs.sql`, `reminder-retrigger.sql`, the Kit tags, the cron). `settings.local.json` holds about 130 one-off permission lines.
15. **Small content mismatches in the built-in fallback content.** "Becoming Era Summer Capsule" (summer is the Expansion Era elsewhere), a morning coffee moment filed under "Soft Evenings". The checkout route comment mentions Anthropic.

### Approved and done on 2026-11-16 (items 1 and 2)

- **Item 1.** Added `insiderTeaser`, `lessonTeaser` and `sipTeaser` to `lib/content.js`. The `/insider`, `/lessons` and `/sip` list pages and their detail pages now pass only the teaser for premium items, and the three `/api/*/[id]` routes use the same helpers. The three DetailGate components now stay locked if the full item does not come back, where before they fell back to the item from the page. The premium Lesson page description now uses the subtitle, not the body.
- **Item 2.** Deleted the nine unused list routes.
- **Checked:** build passes. Run locally against the live Airtable data: none of the 17 premium Insider bodies or quotes appear in the `/insider` page or a premium detail page, `/api/insider/[id]` returns locked with no body or quote, all nine deleted routes return 404, and every series page still loads.
- **What customers will notice:** premium Insider cards now show the title and pillar only, with no quote or excerpt.
- **Not checked:** a signed-in Luxe Insider opening a premium item (no test sign-in was used). That code path was not changed.
- **Not live yet:** the leak stays open on simpliluxe.com until this branch is merged to `main` and deployed.

### Approved and done on 2026-11-16, second batch (items 3, 6, 7, 11)

Branch: `model-audit-2026-11-16-b`. Items 1 and 2 were merged to `main` and are live.

- **Item 3.** `/api/kit/subscribe` now requires a signed-in member and always uses the email on her own account. It ignores any address sent in the request. It only adds accounts created in the last 14 days. `AccountPanel` no longer calls it at sign-up without a session; it calls it the first time a member has a session in that browser.
- **Item 6.** `setKitTag` in `lib/kit.js` now returns whether Kit accepted the change (a 404 on removing a tag counts as done). The preferences route changes the Kit tag first and only then saves the on/off state. If a member turns a notification on and is not on the Kit list yet, she is added and the tag is tried once more. If it still fails, her checkbox goes back and she sees a short "could not update" note. The weekly reminder job and the content alert count now reflect real results.
- **Item 7.** `lib/airtable.js` follows Airtable's paging, up to 1,000 published records per table.
- **Item 11.** The three em dashes in customer copy are replaced with a colon or comma.
- **Checked:** build passes. Against the live Airtable base, all nine series return the same records in the same order as before, and the same again when forced to page 7 at a time. Against Kit with an address that does not exist, tagging returns false and untagging returns true. Locally, the subscribe and preferences routes return 401 with no sign-in and with a bad token, and all pages load.
- **Not checked:** anything that needs a real signed-in member: a new sign-up landing on the Kit list, and the notification checkboxes end to end. No test account was created.
- **Behaviour to know about:** a member who joined before the Kit sync existed is added to the Kit list (tagged App Member) the moment she turns on a notification.

### Confirmed by Staci on the live site after the second batch

- Password reset and sign-in link emails arrive.
- Ticking a notification applies the Kit tag.
- Still unconfirmed: a brand new sign-up landing on the Kit list.

### Supabase pause, 2026-11-16

The free-plan Supabase project had been paused, which took sign-in and every member feature offline. Staci restored it. Added `/api/cron/keep-alive`, a daily Vercel cron that reads one row id so the project stays counted as active. Whether a daily read is enough can only be confirmed over the following weeks.

### Approved and done on 2026-11-16, third batch (items 5, 9, 12)

Branch: `model-audit-2026-11-16-c`.

- **Item 5.** Stripe webhook: "Insider since" is now only filled in when it is empty, so renewals no longer move it. Every database write is checked, and a failed write returns a 500 so Stripe retries. Before, failures were invisible, because Supabase returns errors and does not throw them.
- **Item 9.** Library downloads now carry the file extension of the stored file (for example `.pdf` or `.xlsx`).
- **Item 12.** Deleted `components/SipModal.js` and 21 unused CSS rules (the old premium waitlist form, `.rm` and `.rm.open` which only SipModal used, `siph-img`, `bm2m`, `bath`, `cbg4`).
- **Checked:** build passes. Webhook, run locally with signed test events against a customer id that does not exist: bad signature 400, each subscription and checkout event 200, a checkout for a member id that is not in the database 500, unrelated event 200. No rows were written. Library: asked Supabase for a real signed link before and after; the download name went from `The Simpli Edit _ Vol 07` to `The Simpli Edit _ Vol 07.pdf`. CSS: every class used in the code is still defined, and all pages load.
- **Not checked:** a real Stripe event for a real member (renewal keeping the date). The local setup has no webhook secret, so a temporary local-only test secret was used and removed.

### Fourth batch, 2026-11-17 (item 4 code half, item 14)

Branch: `model-audit-2026-11-16-d`.

- **Item 4, code half.** `/api/kit/notify-content` now accepts the secret in an `x-webhook-secret` header. The old `?secret=` form still works so the Airtable automation keeps running. The saved permission line that held the real secret was removed from `../.claude/settings.local.json`.
- **Item 4, still open, needs Staci:** make a new secret, put it in Vercel as `CONTENT_ALERT_WEBHOOK_SECRET`, change the Airtable automation to send it as the `x-webhook-secret` header, then ask for the `?secret=` fallback to be removed.
- **Item 14.** Added `CLAUDE.md` inside this repo, brought up to date (routes, the teaser rule for premium content, Kit tags, the Supabase pause note, no em dashes). Added a "Turn on email notifications (Kit)" section to `README.md`. Updated the Claude memory notes (live address, sign-in method, pointer to this log).
- **Item 14, left alone:** `../starter-kit/CLAUDE.md` and the other starter-kit docs are outside this repo, so changes there cannot be undone with git. The old CLAUDE.md is now out of date and the starter-kit docs still contain em dashes. The other one-off lines in `settings.local.json` were not touched.
- **Checked:** build passes. The alert route was tested with Kit replaced by a stand-in, so no email could be sent: no secret, wrong header and wrong query all return 401; right header and right query both return 200.
- **Not checked:** the alert route end to end with the real secret, since that would email every opted-in member.

### Fifth batch, 2026-11-17 (item 4 closed)

Branch: `model-audit-2026-11-17-e`.

- **Item 4, Staci's half, done.** New secret saved in Vercel as `CONTENT_ALERT_WEBHOOK_SECRET` and redeployed. All 9 "Promote Approved ..." Airtable automations now send it in the `x-webhook-secret` header, with no secret in the web address. Staci published them and tested one successfully.
- **Item 4, closed.** Removed the `?secret=` fallback from `/api/kit/notify-content`. Only the header is accepted now.
- **Found, left open:** the Airtable scripts send `title: inputConfig.title` and `destinationTable: inputConfig.destinationTable`, but the only script input is named `Title` (and holds the destination series name). Both values arrive empty. The route ignores the body today, so nothing is broken; fix only if the alert should ever use them.
- **Checked:** build passes. The route was called with Kit replaced by a stand-in: right header returns 200; right `?secret=` with no header now returns 401.
- **Not checked:** the live route after this change. The next real approval will show it in the automation's Run history.

### Sixth batch, 2026-11-17 (items 8, 10, 15)

Branch: `model-audit-2026-11-17-f`. Run by Claude Opus 5.5.

- **Item 10.** The homepage era line was already correct (it reads the era from the latest Simpli Edit issue: "Now in The Arrival Era · Q4 2026", confirmed on the live site). The Library, Planner and SimpliBot sign-in cards now say "Sign in and your ... will be waiting." with no "no password needed".
- **Item 15.** Fallback content: "Becoming Era Summer Capsule" is now "Expansion Era Summer Capsule"; the morning coffee moment moved from Soft Evenings to Everyday Indulgence.
- **Item 8, allowance.** New `supabase/simplibot-usage.sql` creates `simplibot_usage`, readable and writable only by the server. `/api/simplibot` now counts there over a rolling 24 hours, uses the shared sign-in check, and only counts a reply that was actually delivered. Until the SQL is run, the count cannot be read and conversations go ahead without a limit, so run the SQL before merging. Old `simplibot_message` rows in `planner_entries` are left in place and no longer used.
- **Item 8, model.** SimpliBot moved from `claude-opus-4-8` to `claude-opus-5-5` at effort `low`, max_tokens 8000, with server-side fallback to `claude-opus-4-8` if the new model's safety filter declines a request. The prompt now asks for plain text (the chat window showed `#` and `**` literally) and plans of about 350 words.
- **Checked:** build passes. The route returns the signed-out message with no token and with a bad token. Pages load, and the new sign-in wording shows. Real API comparison (about $0.20 in total): on a feelings check-in, $0.0172 on 4.8 vs $0.0156 on 5.5; on a capsule plan, $0.0309 on 4.8 vs $0.0279 on 5.5 after the length guidance (it was $0.0482 before it). No em dashes in any reply.
- **Not checked:** a signed-in member chatting end to end, the limit being reached, or the fallback firing.

### What this model caught (a guess, no earlier log exists)

Items 1, 3, 4, 7 and the CLAUDE.md location in item 14. The code comments, CLAUDE.md and the memory notes all state that premium content is redacted on the server, and the per-item routes do redact it, so a reviewer who trusted those notes would pass it. It only shows when the list route and the data handed to browser components are followed end to end and then checked on the live site.

## 2026-11-18, Claude Opus 5.5 (claude-opus-5-5): Simpli Luxe Concierge

Scope: the Concierge, not the app. Branch: `claude/bold-sagan-v9x294` (the Concierge's own branch, not yet merged to `main`; `main` was merged into it first so this log stays in one place).

### What was read

`docs/simpli-luxe-concierge.md`, `docs/simpli-luxe-link-desk.md`, `docs/simpli-luxe-pr-desk.md`, `tools/reel/make_reel.py` and its fonts, `.gitignore`, `CLAUDE.md`, this log, the live Concierge page (Nov 17 run), the Concierge's Airtable tables (Link Library, Income Ledger, Rate Card, Portfolio Pipeline, Pitch Tracker), and every scheduled task on the account. Checks run: em dash search, a test build of a Reel (photo clip first, voice leveling, no end card, clean cover), and a check of which model the app code actually uses.

### Fixed (docs only, nothing customers or members see)

1. `docs/simpli-luxe-concierge.md` described the first version: three sections, an "income" figure, income from screenshots, and a "Numbers to give the Concierge" list with blanks. Rewritten to match how it runs now: four sections, the weekday scheduled task, the Income Ledger, Pitch Tracker and Portfolio Pipeline, and links to the related guides. Checked by rereading against the scheduled task and the live page.
2. `CLAUDE.md` still named `claude-opus-4-8` as the app's AI model. The sixth app batch moved SimpliBot to `claude-opus-5-5` with 4.8 as a fallback. Updated, and added a short note that the Concierge docs and `tools/reel` are not part of the app, plus the rule that income, rates and contract terms never go in this repo. Checked against `app/api/simplibot/route.js`.
3. `tools/reel/make_reel.py`: the `end_card` option worked but was not documented, while the PR Desk guide tells you to leave the end card off for brand UGC. Added to the usage notes. Checked by building a test Reel with `"end_card": false`.

### Waiting on Staci (riskiest first)

1. **The Concierge branch has never been merged.** Everything Concierge-related in this repo (the three guides, the Reel tool, this entry) is only on `claude/bold-sagan-v9x294`. Merging to `main` triggers a Vercel deploy, but nothing in it changes the app.
2. **Two morning briefs, five minutes apart.** "Simpli Luxe Concierge" runs weekdays at 6:10 AM and "SImpli Luxe COS - Daily Brief" runs every day at 6:15 AM. Both read Gmail and the calendar. Suggested: pause the COS brief on weekdays, or narrow it to what the Concierge does not cover. (The COS task name also has a capital I typo.)
3. **The Concierge's caption slipped into an AI phrase.** The Nov 17 Studio caption ended "One cardigan, three tables. That's the whole formula." and placed #affiliate mid-caption. Suggested: add one line to the scheduled task telling it to check every caption against the Simpli Luxe AI Accent Remover rules and put disclosure at the end.
4. **An old copy of the Concierge task is still on the account,** turned off and with no connectors. Suggested: delete it. Deleting also removes the one session it ran on Nov 16.
5. **Rate card contact email.** The rate card lists a different email from the Gmail account pitches would be drafted in. Decide which address brands should see.
6. **Airtable field name typo.** The Simpli Sip table has a checkbox named "Prmoted". The app does not read it, so nothing breaks. Rename only after checking that no Airtable automation or Make scenario uses it.

### What this model caught (a guess for the Concierge, since this is its first audit)

Item 2 under Fixed. The sixth app batch changed SimpliBot's model in the code and the log but not in `CLAUDE.md`, so the next model reading `CLAUDE.md` would have been told the wrong model. It only shows when the instruction file is checked against the code after the batch that changed it. Waiting item 2 also needed every scheduled task on the account side by side, not just the Concierge.
