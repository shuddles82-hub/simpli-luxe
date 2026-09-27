// Server-only Kit (ConvertKit) integration. Handles: adding new members
// to Staci's list tagged "App Member" on sign-up, and toggling the
// notification-preference tags (new content alerts, daily reminder)
// that drive her own Kit Automations. Every call here is safe to
// repeat: creating a subscriber is an upsert, creating a tag is
// idempotent by name, and tagging/untagging is idempotent too.

const APP_MEMBER_TAG = 'App Member';
const tagIdCache = new Map();

function kitHeaders() {
  return {
    'X-Kit-Api-Key': process.env.KIT_API_KEY,
    'Content-Type': 'application/json',
  };
}

async function getOrCreateTagIdByName(name) {
  if (tagIdCache.has(name)) return tagIdCache.get(name);
  try {
    const res = await fetch('https://api.kit.com/v4/tags', {
      method: 'POST',
      headers: kitHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data.tag?.id || null;
    if (id) tagIdCache.set(name, id);
    return id;
  } catch {
    return null;
  }
}

export async function addMemberToKit({ email, displayName }) {
  if (!process.env.KIT_API_KEY || !email) return;
  try {
    await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: kitHeaders(),
      body: JSON.stringify({
        email_address: email,
        ...(displayName ? { first_name: displayName } : {}),
      }),
    });
    const tagId = await getOrCreateTagIdByName(APP_MEMBER_TAG);
    if (!tagId) return;
    await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
      method: 'POST',
      headers: kitHeaders(),
      body: JSON.stringify({ email_address: email }),
    });
  } catch {
    // A Kit hiccup should never block sign-up.
  }
}

// Tags (or untags) a member with a named tag, creating the tag in Kit
// if it doesn't exist yet. Used for the notification-preference toggles
// and for firing the "Content Alert" trigger tag.
export async function setKitTag({ email, tagName, enabled }) {
  if (!process.env.KIT_API_KEY || !email || !tagName) return false;
  try {
    if (enabled) {
      const tagId = await getOrCreateTagIdByName(tagName);
      if (!tagId) return false;
      await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
        method: 'POST',
        headers: kitHeaders(),
        body: JSON.stringify({ email_address: email }),
      });
    } else {
      const tagId = await getOrCreateTagIdByName(tagName);
      if (!tagId) return false;
      await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers?email_address=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: kitHeaders(),
      });
    }
    return true;
  } catch {
    return false;
  }
}

// All subscriber emails currently under a named tag (paginated).
export async function listEmailsWithTag(tagName) {
  if (!process.env.KIT_API_KEY) return [];
  const tagId = await getOrCreateTagIdByName(tagName);
  if (!tagId) return [];
  const emails = [];
  let cursor = null;
  try {
    do {
      const url = new URL(`https://api.kit.com/v4/tags/${tagId}/subscribers`);
      if (cursor) url.searchParams.set('after', cursor);
      const res = await fetch(url, { headers: kitHeaders() });
      if (!res.ok) break;
      const data = await res.json();
      for (const s of data.subscribers || []) emails.push(s.email_address);
      cursor = data.pagination?.has_next_page ? data.pagination.end_cursor : null;
    } while (cursor);
  } catch {
    // return whatever we collected so far
  }
  return emails;
}
