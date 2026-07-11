# Simpli Luxe Web App

The Simpli Luxe site as a real web application (Next.js). It reads
published content from your Airtable base through secure server routes,
so your Airtable token never appears in the browser.

## Run it on your computer

1. Open a terminal in this folder.
2. Run `npm install` (first time only).
3. Run `npm run dev`.
4. Open http://localhost:3000 in your browser.

Without Airtable connected, the site shows its built-in content
(everything from the v4.0 site). That is normal.

## Connect Airtable (one time)

1. Go to airtable.com/create/tokens and create a token:
   - Scope: only `data.records:read`
   - Access: only the Simpli Luxe base
2. Find your Base ID: open the Simpli Luxe base in your browser and
   copy the part of the web address that starts with `app` (it looks
   like `appXXXXXXXXXXXXXX`).
3. In this folder, make a copy of `.env.example` named `.env.local`
   and paste both values in. Never share or commit this file.
4. Restart `npm run dev`. Published records now appear on the site
   within about 10 minutes of being set to Published in Airtable.

## Turn on member accounts (one time)

Member accounts power the ✦ Save button and the Members page. Until
these steps are done, the site simply hides those features.

1. Go to supabase.com and create a free account, then click
   "New project". Name it Simpli Luxe, choose a strong database
   password (save it somewhere safe; you will rarely need it), and
   pick the region closest to you.
2. When the project finishes setting up, click "SQL Editor" in the
   left sidebar. Open the file `supabase/schema.sql` from this folder,
   copy everything, paste it into the editor, and press "Run". This
   creates the member tables (profiles, saves, planner, journal) with
   privacy rules so each member can only ever see her own data.
3. Click the gear icon (Project Settings) then "API". Copy two values:
   - Project URL
   - anon public key (the long one labeled "anon" "public")
4. Paste them into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never copy the "service_role" key
   anywhere; it stays in Supabase.
5. In Supabase, go to Authentication > URL Configuration and set the
   Site URL to your website address (while testing on your computer,
   `http://localhost:3000`). When you deploy, change it to your live
   address and add it under Redirect URLs too.
6. Restart `npm run dev`. The Members tab now offers email sign-in
   (a magic link, no passwords), and every shift, note, lesson, and
   sip shows a ✦ Save button.

## Turn on the vision board (one time)

The planner's vision board stores members' pictures privately in
Supabase. One small step turns it on:

1. In Supabase, click "SQL Editor" in the left sidebar.
2. Open the file `supabase/vision-board.sql` from this folder, copy
   everything, paste it into the editor, and press "Run".

That creates a private picture area where each member can only ever
see her own images. Until this is done, the planner simply shows a
gentle note on the vision board card.

## Turn on SimpliBot (one time)

SimpliBot is the members-only soft life coach, speaking in the brand
voice. Until this step is done, the SimpliBot page shows a gentle
"almost here" note.

1. Go to console.anthropic.com, sign in (or create an account), and
   open "API Keys". Click "Create Key", name it "Simpli Luxe website",
   and copy the key (it starts with sk-ant-).
2. Paste it into `.env.local` on the `ANTHROPIC_API_KEY=` line.
3. In Supabase, open the SQL Editor and run the file
   `supabase/insider.sql` from this folder. It adds the Luxe Insider
   flag to member profiles.
4. Restart `npm run dev`. Signed-in members can now talk to SimpliBot
   (10 conversations a day; Luxe Insiders receive 100).

Until Stripe checkout is connected, you can gift Insider status by
hand: Supabase > Table Editor > profiles > tick `is_insider` for that
member.

Note: SimpliBot conversations use the Anthropic API, which bills per
use. At MVP traffic this is modest; you can watch spending at
console.anthropic.com under Usage.

## Turn on Luxe Insider (Stripe subscription)

This lets members subscribe to Luxe Insider and unlocks the higher
SimpliBot limit for them. It has a few one-time pieces.

1. In Supabase, open the SQL Editor and run `supabase/stripe.sql`. It
   links members to Stripe and locks the membership fields so only the
   system can grant Insider status.
2. Get your Supabase service-role key: Supabase > Settings > API >
   `service_role` (the secret one, NOT the anon key). Paste it into
   `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`. Keep this private; it is
   powerful and must never go in the browser or a public repo.
3. In Stripe (dashboard.stripe.com), start in Test mode (top toggle)
   while you set up:
   - Go to Developers > API keys, copy the Secret key, and paste it
     into `.env.local` as `STRIPE_SECRET_KEY`.
   - Go to Product catalog > Add product. Name it "Luxe Insider",
     choose Recurring, set your monthly price, and save. Open the price
     and copy its ID (starts with `price_`) into `.env.local` as
     `STRIPE_PRICE_ID`.
4. Restart `npm run dev`. The Members page now shows a "Become a Luxe
   Insider" card. You can test the whole flow with Stripe's test card
   `4242 4242 4242 4242`, any future date, any CVC.
5. The webhook keeps Insider status in sync when subscriptions renew or
   cancel. It needs a public web address, so set it up after you deploy
   (see below): in Stripe, Developers > Webhooks > Add endpoint, URL
   `https://your-site/api/stripe/webhook`, and subscribe to
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`. Copy the signing secret (starts with
   `whsec_`) into `STRIPE_WEBHOOK_SECRET` in Vercel. (While testing on
   your computer, the app already reconciles status right after checkout,
   so the webhook is only needed once you are live.)

When you are ready to accept real payments, switch Stripe out of Test
mode and replace the test keys with the live ones.

## Turn on the Luxe Library

The Library is a members-only shelf of downloads (guides, PDFs, anything
you want to share). Some items can be free for every member; others can
be reserved for Luxe Insiders. One setup step, then adding files is a
two-part manual step each time (no separate admin screen yet, by design,
to keep this simple).

1. In Supabase, open the SQL Editor and run `supabase/library.sql`. It
   creates the private storage area and the list of items, and locks
   both down so only your website's server can read them, never a
   member directly.
2. To add a file:
   - In Supabase, go to **Storage** > the **library** bucket > **Upload
     file**. Upload it into any subfolder you like, for example
     `guides/soft-life-starter-kit.pdf`. Copy that exact path.
   - Go to **Table Editor** > **library_items** > **Insert row**. Fill
     in `title`, optionally `description` and `category`, set `tier` to
     `free` or `insider`, and paste the path you copied into
     `storage_path`. Save.
   - It appears on the live Library page within a minute or two for any
     signed-in member (or Luxe Insiders only, if you set that tier).

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose "Add New Project" and import that repository.
3. In the project's Settings > Environment Variables, add
   `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`,
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, and
   `SUPABASE_SERVICE_ROLE_KEY` with the same values as your `.env.local`.
4. Deploy. Content updates flow automatically; no redeploy needed
   when you publish new records.

## Where content comes from

Each series reads only `Status = Published` rows from its own table:

| Page | Airtable table |
|---|---|
| /shift | Soft Life Shift (Notes to Self via the Type field) |
| /lessons | Luxe Life Lessons |
| /sip | The Simpli Sip |
| /edit | The Simpli Edit |
| /styled | Simpli Styled |
| /shop | Shop Collections (homepage spotlight uses Featured) |

The Content Queue table is your AI review inbox only. The site never
shows records from it. Approve a draft there, promote it into the
matching table above, set Status to Published, and it appears on the
site.
