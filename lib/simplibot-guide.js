// Copy for the "What can I ask SimpliBot?" guide, and the suggestion-chip
// prompts shown above the chat input. Kept in one place since both are
// drawn from the same seven concierge domains.

export const GUIDE_INTRO =
  "SimpliBot is your soft life concierge. Think of her as the friend with impeccable taste who always knows what to wear, what to sip, and how to make any budget feel luxurious. Ask her to:";

export const GUIDE_ITEMS = [
  { label: 'Style you', body: 'outfit planning, capsule wardrobes, closet audits, occasion dressing' },
  { label: 'Plan your money, softly', body: 'budgets that breathe, luxe-for-less swaps, savings with intention' },
  { label: 'Set the table', body: 'mocktails, dinner parties, brunch menus, hosting on any budget' },
  { label: 'Plan your escape', body: 'weekend itineraries, packing lists, travel wardrobes' },
  { label: 'Curate your home', body: 'shelf styling, cozy corners, seasonal refreshes' },
  { label: 'Build your rituals', body: 'morning routines, evening resets, self-care that actually fits your life' },
  { label: 'Find the perfect gift', body: 'thoughtful, beautiful, within budget' },
];

export const GUIDE_RULE =
  "One rule of the house: everything is affordable luxury. She'll never tell you luxury requires a certain price tag.";

// Rotation chips, one set per day of week (0 = Sunday ... 6 = Saturday),
// loosely themed so the week has a rhythm. 3-4 are shown at random.
export const ROTATION_CHIPS = {
  0: [
    { label: 'Plan my Sunday reset', message: 'Help me plan a soft Sunday reset for tomorrow.' },
    { label: 'Build an evening wind-down', message: 'Build me a gentle evening wind-down ritual.' },
    { label: 'Weekly reset routine', message: 'Give me a simple weekly reset routine for this week.' },
    { label: 'Journaling prompt for tonight', message: 'Give me a journaling prompt for tonight.' },
  ],
  1: [
    { label: 'Capsule wardrobe for this week', message: 'Help me plan a capsule wardrobe for this week.' },
    { label: 'Outfit for a big Monday', message: 'Help me get dressed for a big Monday.' },
    { label: 'Closet audit', message: 'Walk me through a quick closet audit.' },
    { label: 'Occasion outfit idea', message: 'I need an outfit idea for an occasion coming up.' },
  ],
  2: [
    { label: 'A budget that breathes', message: 'Help me build a simple budget that breathes.' },
    { label: 'Luxe-for-less swap', message: 'Give me a luxe-for-less swap for something I love.' },
    { label: 'Savings plan for a purchase', message: 'Help me plan savings for something I want to buy.' },
    { label: 'Mindful spending check-in', message: 'Walk me through a mindful spending check-in.' },
  ],
  3: [
    { label: 'Refresh a corner of my home', message: 'Help me refresh a corner of my home for this season.' },
    { label: 'Style my nightstand', message: 'Help me style my nightstand.' },
    { label: 'Cozy entryway edit', message: 'Give me ideas for a cozy entryway edit.' },
    { label: 'Seasonal scent and lighting', message: 'Recommend a seasonal scent and lighting refresh for my home.' },
  ],
  4: [
    { label: 'Plan a mocktail for tonight', message: 'Give me a mocktail recipe for tonight.' },
    { label: 'Host a low-key dinner', message: 'Help me plan a low-key dinner party.' },
    { label: 'Brunch menu on a budget', message: 'Plan me a brunch menu on a budget.' },
    { label: 'Tablescape idea', message: 'Give me a simple tablescape idea.' },
  ],
  5: [
    { label: 'Weekend getaway itinerary', message: 'Plan me a weekend getaway itinerary.' },
    { label: 'Build a packing list', message: 'Build me a packing list for an upcoming trip.' },
    { label: 'Travel capsule wardrobe', message: 'Help me plan a travel capsule wardrobe.' },
    { label: 'Day-trip plan', message: 'Plan me a day trip for this weekend.' },
  ],
  6: [
    { label: 'Find a gift for someone I love', message: 'Help me find a gift for someone I love.' },
    { label: 'Gift under $50', message: 'Curate a thoughtful gift idea under $50.' },
    { label: 'Host a gathering tonight', message: 'Help me plan a small gathering for tonight.' },
    { label: 'Self-care ritual for today', message: 'Give me a self-care ritual I can do today.' },
  ],
};

// Always-available chip, one shown at random alongside the daily rotation.
export const ALWAYS_AVAILABLE_CHIPS = [
  { label: 'Surprise me', message: 'Surprise me with something luxe-for-less for today.' },
  { label: 'Help me plan today', message: 'Help me plan today, softly.' },
  { label: 'What should I wear this week', message: 'What should I wear this week?' },
  { label: 'Ask me anything', message: "I'm not sure what I need, ask me a few questions and help me figure it out." },
];

function pick(arr, count) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < count) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

export function pickSuggestionChips() {
  const day = new Date().getDay();
  const daily = pick(ROTATION_CHIPS[day] || [], 3 + Math.round(Math.random()));
  const always = pick(ALWAYS_AVAILABLE_CHIPS, 1);
  return [...daily, ...always];
}
