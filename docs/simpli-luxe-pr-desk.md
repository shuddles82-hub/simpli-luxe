# PR Desk and Portfolio: Simpli Luxe Concierge Add-On

The Concierge's PR agent and editor for Simpli Luxe Studio, Staci's UGC business. Rates live in the **Rate Card** table in Airtable, taken from the Simpli Luxe UGC Rate Card 2026 PDF, so they stay out of this repo.

## Airtable tables (Simpli Luxe base)

| Table | What it holds |
| --- | --- |
| Rate Card | Content rates, packages (The Starter, The Signature, The Retainer), usage rights, add-ons and booking terms |
| Portfolio Pipeline | Each portfolio piece from Script ready to Filmed, Editing, Ready for portfolio and In portfolio, with category, deliverable, script, alternate hooks and shot list |
| Pitch Tracker | Brands to pitch, contact, offer, status, last touch and next step |
| Income Ledger | Every payment and pending commission, totaled each morning against the monthly goal |

## Portfolio workflow

1. **Script.** Paste a script into the Concierge chat. Claude files it in Portfolio Pipeline with the category and rate card deliverable it shows off, writes a second hook (The Starter promises 2 hooks per video, so the portfolio should show that) and a shot list.
2. **Film.** Shoot at 1080p, 30 fps. Film each hook separately and grab 5 to 10 seconds of b-roll per shot.
3. **Edit.** Upload the clips. Claude cuts a branded 9:16 version with `tools/reel/make_reel.py`, one per hook, plus a clean cover frame. For a brand-style portfolio piece, leave off the Simpli Luxe end card, since brands post UGC on their own channels.
4. **Portfolio.** Finish in Edits or CapCut if needed, upload to the portfolio, and add the link to the row.

Aim for at least one piece per category on the rate card, and at least one of each video deliverable.

## Pitch rules

- Claude writes pitches as **Gmail drafts** for Staci to review and send. It never sends.
- Quote only rates from the Rate Card table. Lead with The Starter for a first project unless the brand asks for more.
- Professional register: clear, warm, specific about the product, no hashtags, no brand catchphrases in the body.
- Every pitch includes one concrete content idea for that product.
- Drafts come from the connected Gmail account. The rate card lists a different contact address, so check the From line before sending.
- Follow up once, 5 business days after sending, then mark the brand Passed or keep it on a monthly list.

## Pitch template

Subject: UGC for [Brand]: [one-line idea]

> Hi [Name],
>
> I'm Staci, founder of Simpli Luxe, an affordable luxury lifestyle brand for women who want an elevated everyday without overspending. I've been using [product] and I'd love to create content for [Brand].
>
> One idea: [a concept in one sentence, for example a 30-second "desk to dinner" routine showing the blazer three ways].
>
> I create polished, real-life UGC for fashion, beauty, home and wellness brands. My portfolio is here: [portfolio link], and my 2026 rate card is attached. For a first project, The Starter gives you 3 videos with 2 hooks each, ready to A/B test.
>
> Would you be open to a product send or a quick call this month?
>
> Warmly,
> Staci Huddleston
> Simpli Luxe Studio
> [contact email] · @simpli_staci

## Follow-up template

Subject: Re: UGC for [Brand]: [one-line idea]

> Hi [Name],
>
> Following up on my note from [day]. Here's the hook I'd open with: "[hook]". Happy to send a short sample if that helps you picture it.
>
> Warmly,
> Staci

## Prompts for the Concierge chat

**File a script**
> Add this script to my Portfolio Pipeline: [paste script]. Pick the category and rate card deliverable it shows off, write one alternate hook and a shot list, and mark it Script ready.

**Draft a pitch**
> Draft a pitch to [brand] for [product], contact [name and email if you have it]. Use my pitch template and Rate Card, lead with [The Starter], and save it as a Gmail draft. Add the brand to my Pitch Tracker as Draft ready.

**Who to pitch**
> Look at my Link Library and Income Ledger and suggest 5 brands I already link to or earn from that would make good UGC pitches, with one content idea each. Add them to my Pitch Tracker as To pitch.
