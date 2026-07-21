// Server-only Kit (ConvertKit) integration. Adds new members to Staci's
// email list, tagged "App Member", so her list stays in sync with app
// sign-ups automatically. Every call here is safe to repeat: creating a
// subscriber is an upsert, creating a tag is idempotent by name, and
// tagging an already-tagged subscriber just returns 200.

const KIT_TAG_NAME = 'App Member';
let cachedTagId = null;

function kitHeaders() {
  return {
    'X-Kit-Api-Key': process.env.KIT_API_KEY,
    'Content-Type': 'application/json',
  };
}

async function getOrCreateTagId() {
  if (cachedTagId) return cachedTagId;
  try {
    const res = await fetch('https://api.kit.com/v4/tags', {
      method: 'POST',
      headers: kitHeaders(),
      body: JSON.stringify({ name: KIT_TAG_NAME }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    cachedTagId = data.tag?.id || null;
    return cachedTagId;
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
    const tagId = await getOrCreateTagId();
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
