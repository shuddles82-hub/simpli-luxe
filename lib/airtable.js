// Server-only Airtable access. The token never reaches the browser:
// these functions run in server components and API routes only.
// Every function returns [] when Airtable is unreachable or env vars
// are missing, so the site always renders its built-in content.

const REVALIDATE_SECONDS = 600;

// `table` may be a string or an array of candidate names; the first
// name that exists in the base wins. Airtable bases in the wild name
// these tables slightly differently ("Luxe Life Lesson" vs "Luxe Life
// Lessons"), and a name mismatch must degrade gracefully, not break
// the site.
async function fetchRecords(table, { sortField, filterFormula } = {}) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) return [];

  const params = new URLSearchParams();
  params.set('filterByFormula', filterFormula || "{Status}='Published'");
  params.set('maxRecords', '100');
  if (sortField) {
    params.append('sort[0][field]', sortField);
    params.append('sort[0][direction]', 'desc');
  }

  const names = Array.isArray(table) ? table : [table];
  for (const name of names) {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(name)}?${params.toString()}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) continue; // table not found under this name; try the next
      const data = await res.json();
      return Array.isArray(data.records) ? data.records : [];
    } catch {
      // network trouble; trying another name won't help
      return [];
    }
  }
  return [];
}

// Real-world records vary: field names drift ("How To Make It" vs
// "How to Make It", "Attachments" vs "Attachment", content in the
// primary "Text"/"Name" field instead of "Title") and select options
// sometimes carry trailing spaces. Read defensively and trim.
function field(fields, ...names) {
  for (const name of names) {
    const v = fields[name];
    if (v !== undefined && v !== null && v !== '') {
      return typeof v === 'string' ? v.trim() : v;
    }
  }
  return '';
}

// Long-text fields hold lists as one item per line (sometimes with
// bullet characters, checkmark emoji, or an all-caps header line).
// Turn them into clean arrays.
function splitList(text) {
  if (!text) return [];
  return String(text)
    .split(/\r?\n|•/)
    .map((s) =>
      s
        .replace(/^[\s✦✓✔✅❇☑️\u{FE0F}\-–*]+/u, '')
        .replace(/^\d+[.)]\s*/, '')
        .trim()
    )
    .filter(Boolean)
    .filter((s) => !/^(ingredients|how to make( it)?|directions|steps)$/i.test(s));
}

function attachmentUrl(fields, name = 'Attachment') {
  for (const key of [name, `${name}s`]) {
    const att = fields[key];
    if (Array.isArray(att) && att[0] && att[0].url) return att[0].url;
  }
  return null;
}

// Every attachment in a field, not just the first, each tagged with
// whether it is a video clip. Used by tables where a single field can
// hold a mix of photos and a short mp4 (Life's Little Luxuries).
function attachmentsList(fields, name = 'Attachments') {
  for (const key of [name, name.endsWith('s') ? name.slice(0, -1) : `${name}s`]) {
    const att = fields[key];
    if (Array.isArray(att) && att.length > 0) {
      return att
        .filter((a) => a && a.url)
        .map((a) => ({
          url: a.url,
          isVideo: /^video\//.test(a.type || '') || /\.(mp4|mov|webm)(\?|$)/i.test(a.url),
        }));
    }
  }
  return [];
}

function firstHexColors(text, max = 5) {
  if (!text) return [];
  const matches = String(text).match(/#[0-9a-fA-F]{6}\b/g) || [];
  return matches.slice(0, max);
}

// Soft Life Shift table. Holds both Shift Cards and Notes to Self
// (Type field). Returned in feed order: Episode descending.
export async function getShiftFeed() {
  const records = await fetchRecords('Soft Life Shift', { sortField: 'Episode' });
  const items = records.map((r) => {
    const f = r.fields || {};
    return {
      id: r.id,
      type: field(f, 'Type') === 'Note to Self' ? 'note' : 'shift',
      title: field(f, 'Title', 'Text', 'Name'),
      subtitle: field(f, 'Subtitle'),
      body: field(f, 'Body'),
      quote: field(f, 'Quote'),
      letGoOf: splitList(field(f, 'Let Go Of')),
      inviteIn: splitList(field(f, 'Invite In')),
      tip: field(f, 'Tip'),
      journalingPrompt: field(f, 'Journaling Prompt'),
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      episode: f['Episode'] || null,
      image: attachmentUrl(f),
      isNew: false,
    };
  });
  const newestShift = items.find((i) => i.type === 'shift');
  if (newestShift) newestShift.isNew = true;
  return items;
}

export async function getLessons() {
  const records = await fetchRecords(['Luxe Life Lessons', 'Luxe Life Lesson'], {
    sortField: 'Episode',
  });
  return records.map((r, i) => {
    const f = r.fields || {};
    return {
      id: r.id,
      episode: f['Episode'] || null,
      title: field(f, 'Title', 'Text', 'Name'),
      subtitle: field(f, 'Subtitle'),
      body: field(f, 'Body'),
      quote: field(f, 'Quote'),
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      category: field(f, 'Category'),
      image: attachmentUrl(f),
      isNew: i === 0,
    };
  });
}

export async function getSips() {
  const records = await fetchRecords(['The Simpli Sip', 'Simpli Sip'], {
    sortField: 'Episode',
  });
  return records.map((r, i) => {
    const f = r.fields || {};
    return {
      id: r.id,
      episode: f['Episode'] || null,
      title: field(f, 'Title', 'Text', 'Name'),
      vibe: field(f, 'Vibe'),
      flavorProfile: field(f, 'Flavor Profile'),
      ingredients: splitList(field(f, 'Ingredients')),
      howToMake: splitList(field(f, 'How to Make It', 'How To Make It')),
      ritualMoment: field(f, 'Ritual Moment'),
      vibeNotes: field(f, 'Vibe Notes'),
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      flavorTags: Array.isArray(f['Flavor Tags'])
        ? f['Flavor Tags'].map((t) => String(t).trim())
        : [],
      image: attachmentUrl(f),
      isNew: i === 0,
    };
  });
}

// The Simpli Edit: one row per newsletter issue (Volume). Each issue
// is a full magazine, so this pulls every section field, not just the
// cover — the /edit/[id] reader page renders them all.
export async function getEditIssues() {
  const records = await fetchRecords('The Simpli Edit', { sortField: 'Volume' });
  return records.map((r, i) => {
    const f = r.fields || {};
    return {
      id: r.id,
      volume: f['Volume'] || null,
      title: field(f, 'Title', 'Text', 'Name'),
      subtitle: field(f, 'Subtitle'),
      tagline: field(f, 'Tagline'),
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      pullQuote: field(f, 'Pull Quote'),
      cover: attachmentUrl(f),
      isNew: i === 0,
      lessonTitle: field(f, 'Luxe Life Lesson Title'),
      lessonBody: field(f, 'Luxe Life Lesson Body'),
      styledTitle: field(f, 'Simpli Styled Title'),
      capsuleFormulas: splitList(field(f, 'Capsule Formulas')),
      capsuleStaples: splitList(field(f, 'Capsule Staples')),
      shiftBody: field(f, 'Soft Life Shift Body'),
      letGoOf: splitList(field(f, 'Let Go Of')),
      inviteIn: splitList(field(f, 'Invite In')),
      lifestyleBody: field(f, 'Lifestyle & Home Body'),
      sipName: field(f, 'Simpli Sip Name'),
      shopUnder30: splitList(field(f, 'Shop Edit Under $30')),
      shopUnder75: splitList(field(f, 'Shop Edit Under $75')),
      shopSplurges: splitList(field(f, 'Shop Edit Splurges', 'Shop Edit Splurge')),
      editorsNote: field(f, "Editors Note", "Editor's Note"),
    };
  });
}

export async function getStyledCapsules() {
  const records = await fetchRecords('Simpli Styled');
  // No sortable field for recency in this table; sort by record creation.
  records.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
  return records.map((r, i) => {
    const f = r.fields || {};
    const formulas = [];
    for (let n = 1; n <= 10; n++) {
      const v = f[`Outfit Formula ${n}`];
      if (v) formulas.push(v);
    }
    return {
      id: r.id,
      name: field(f, 'Capsule Name', 'Title', 'Text', 'Name'),
      tagline: field(f, 'Tagline'),
      season: field(f, 'Season'),
      era: field(f, 'Era'),
      category: field(f, 'Category'),
      palette: firstHexColors(f['Color Palette']),
      staples: splitList(field(f, 'Capsule Staples')),
      formulas,
      styleNotes: field(f, 'Style Notes'),
      styleTip: field(f, 'Style Tip'),
      ltkLink: field(f, 'LTK Link'),
      shopMyLink: field(f, 'ShopMy Link'),
      image: attachmentUrl(f),
      isNew: i === 0,
    };
  });
}

// Life's Little Luxuries: short, image-led moments. A record may carry
// several photos (or a short video clip) in one Attachments field; the
// feed shows the first as the cover and the rest live in a carousel.
export async function getLittleLuxuries() {
  const records = await fetchRecords(["Life's Little Luxuries", 'Little Luxuries']);
  records.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
  return records.map((r, i) => {
    const f = r.fields || {};
    const media = attachmentsList(f);
    return {
      id: r.id,
      title: field(f, 'Title', 'Text', 'Name'),
      body: field(f, 'Body', 'Caption', 'Description'),
      category: field(f, 'Category'),
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      media,
      cover: media[0]?.url || null,
      isNew: i === 0,
    };
  });
}

export async function getShopCollections({ featuredOnly = false } = {}) {
  const filterFormula = featuredOnly
    ? "AND({Status}='Published',{Featured}=1)"
    : "{Status}='Published'";
  const records = await fetchRecords('Shop Collections', { filterFormula });
  records.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
  return records.map((r) => {
    const f = r.fields || {};
    return {
      id: r.id,
      name: field(f, 'Collection Name', 'Title', 'Text', 'Name'),
      tagline: field(f, 'Tagline'),
      description: field(f, 'Description'),
      type: field(f, 'Type'),
      category: field(f, 'Category'),
      price: f['Price'] || null,
      kitTier: field(f, 'Kit Tier'),
      whatsIncluded: splitList(field(f, "What's Included")),
      shopMyLink: field(f, 'ShopMy Link'),
      ltkLink: field(f, 'LTK Link'),
      kitLink: field(f, 'Kit Link'),
      productCount: f['Product Count'] || null,
      era: field(f, 'Era'),
      season: field(f, 'Season'),
      featured: Boolean(f['Featured']),
      image: attachmentUrl(f),
    };
  });
}
