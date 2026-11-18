---
name: new-model-audit
description: Run when a new AI model drops. Reads the whole project, fixes only what it is sure about, lists the rest for review, and logs what this model caught that the last one missed.
---

# New Model Audit

Use this the first time I work in a project after switching to a new model, or when I say "run the new model audit."

## Before you start

1. Tell me in one line which model you are.
2. If this is a git project, check for unsaved or uncommitted work. If there is any, stop and ask me to commit it first. Then make a new branch called model-audit-[today's date], so I can undo every change in one step.
3. If you can't edit files here (for example, a Claude or ChatGPT Project), don't try. Hand me corrected versions to paste back in instead.
4. Look for a file called model-audit-log.md in the top folder of the project. If it's there, read it so you know what earlier models found, fixed and left for me.

## Simpli Luxe rules for this audit

Follow my Simpli Luxe brand kit for every answer. Tagline: Luxury doesn't have to be expensive. Community: Luxe Lifers. Sign off: Stay simpli luxe. No em dashes anywhere, in code comments, docs, or captions. Most calls to action point to the Simpli Luxe App at simpliluxe.com. ShopMy only where a product is actually in the content, with #ad or #affiliate disclosure. Voice: warm, practical, affordable luxury. No hustle language and no financial lectures.

Do not mix Simpli Luxe and work identities. Do not put work material into a Simpli Luxe project, and do not put Simpli Luxe brand rules into work material.

For the Simpli Luxe Concierge: it starts empty on purpose. Never invent income, brand deals, dates, or amounts. If a number is missing, flag it as missing.

## Read everything

Read the whole project. That means code, docs, instruction files (CLAUDE.md, AGENTS.md, skills, subagents), settings, notes and memory files. Don't skim or sample. If the project is too big for one pass, split it into areas, go area by area (or give each area to a subagent if you can), and put the findings together at the end.

## What to look for

- **Broken.** Anything that errors or fails a test, plus any file, link, path or command it points to that no longer exists. Check before you call something missing.
- **Inconsistent.** Two files that disagree, or the same rule written several different ways. Names that don't match count too.
- **Inefficient.** Duplicated code and steps that run twice. Anything slow or wasteful.
- **No longer needed.** Dead code and old files. Also workarounds or cautions written for an older model that you don't need.

## Fix or list

Fix something yourself only when you're sure it's wrong, the fix is small, it doesn't change what my users or customers see, and you can check that it worked by running it, testing it or rereading it.

Everything else goes on the review list. Always ask before you delete a file or touch payments, pricing, logins, or anything that sends messages to people.

## Report back

Keep it short and in plain words.

1. **Fixed.** List each fix with its file and how you checked it.
2. **For my review.** Number them, riskiest first. Give the file, what's wrong and what you'd do.
3. **What this model caught.** Name the findings you think the previous model would have missed, and why. Use model-audit-log.md to compare if it exists. If it doesn't, give your best guess and say it's a guess.

Then add an entry to model-audit-log.md with today's date, your model name, what you fixed, and what's waiting on me. Create the file if it isn't there. Wait for me to approve review items by number before you do any of them.
