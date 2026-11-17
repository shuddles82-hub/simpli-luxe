// The Simpli Edit issues published as full designed HTML magazines in
// public/ (simpli-edit-vol-NN.html). Each one is shown inside the app
// at /edit/vol-NN (see EditMagazine), the link to use in emails and
// posts. To add an issue: drop its HTML file in public/, add its
// volume here, and either add an Airtable row for it or an entry to
// HTML_ONLY_EDIT_ISSUES below so it shows up on the tab.

const HTML_VOLUMES = new Set([1, 2, 3, 4, 5, 6, 7, 8]);

export function editHtmlUrl(volume) {
  const n = Number(volume);
  if (!HTML_VOLUMES.has(n)) return null;
  return `/simpli-edit-vol-${String(n).padStart(2, '0')}.html`;
}

// The in-app address for an issue, e.g. vol-08 for /edit/vol-08.
export function editSlug(volume) {
  const n = Number(volume);
  return n > 0 ? `vol-${String(n).padStart(2, '0')}` : null;
}

// Issues that exist as HTML but may not have an Airtable row yet.
// An Airtable row with the same Volume always takes precedence.
export const HTML_ONLY_EDIT_ISSUES = [
  {
    id: 'html-e8',
    volume: 8,
    volLabel: 'Vol 08 · Fall 2026',
    title: 'The Winning Season',
    subtitle: 'Fall / Holiday 2026 · The Arrival Era',
    tagline: 'Peace Over Pressure · Home As Sanctuary · Fall Edit · New Adventures',
    pullQuote: 'Even when it wasn’t the plan, it was working the whole time.',
    cover: '/simpli-edit-covers/vol-08.jpg',
    season: 'Fall',
    seasonClass: 'bfall',
    era: 'The Arrival Era',
  },
];
