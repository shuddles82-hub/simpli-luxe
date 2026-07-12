// Lightweight link support for content text written in Airtable.
// Two forms work anywhere in body text and list items:
//   1. A bare URL:            https://shopmy.us/collections/12345
//   2. A labeled link:        [Shop the capsule](https://shopmy.us/...)
// Bare URLs get a clean label from their domain, so a pasted ShopMy
// link reads as "ShopMy ↗" instead of a long raw address.

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<)\]]+)/g;

const DOMAIN_LABELS = [
  { match: 'shopmy', label: 'ShopMy' },
  { match: 'ltk.', label: 'LTK' },
  { match: 'liketoknow', label: 'LTK' },
  { match: 'kit.com', label: 'Kit' },
  { match: 'amazon.', label: 'Amazon' },
  { match: 'instagram', label: 'Instagram' },
  { match: 'tiktok', label: 'TikTok' },
  { match: 'pinterest', label: 'Pinterest' },
  { match: 'youtube', label: 'YouTube' },
];

function labelFor(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const known = DOMAIN_LABELS.find((d) => host.includes(d.match));
    return known ? known.label : host;
  } catch {
    return url;
  }
}

export function linkify(text) {
  const s = String(text ?? '');
  if (!s.includes('http')) return s;
  const out = [];
  let last = 0;
  let m;
  let key = 0;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const href = m[2] || m[3];
    // Trailing punctuation right after a bare URL belongs to the
    // sentence, not the link.
    const cleaned = href.replace(/[.,;:!?]+$/, '');
    const trailing = href.slice(cleaned.length);
    const label = m[1] || labelFor(cleaned);
    out.push(
      <a key={key++} className="body-link" href={cleaned} target="_blank" rel="noreferrer">
        {label}
        {!m[1] && ' ↗'}
      </a>
    );
    if (trailing) out.push(trailing);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
