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

### What this model caught (a guess, no earlier log exists)

Items 1, 3, 4, 7 and the CLAUDE.md location in item 14. The code comments, CLAUDE.md and the memory notes all state that premium content is redacted on the server, and the per-item routes do redact it, so a reviewer who trusted those notes would pass it. It only shows when the list route and the data handed to browser components are followed end to end and then checked on the live site.
