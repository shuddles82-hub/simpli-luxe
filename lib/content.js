// Content access for pages: live Airtable records when Published rows
// exist, the built-in fallback content otherwise. Detail pages look
// items up by id against the same lists, so fallback content is just
// as linkable as live content.

import {
  getShiftFeed,
  getLessons,
  getSips,
  getEditIssues,
  getStyledCapsules,
  getShopCollections,
} from './airtable';
import {
  FALLBACK_SHIFT_FEED,
  FALLBACK_LESSONS,
  FALLBACK_SIPS,
  FALLBACK_EDIT_ISSUES,
  FALLBACK_STYLED,
  FALLBACK_COLLECTIONS,
} from './fallback';

export async function getShiftFeedContent() {
  const live = await getShiftFeed();
  return live.length > 0 ? live : FALLBACK_SHIFT_FEED;
}

export async function getLessonsContent() {
  const live = await getLessons();
  return live.length > 0 ? live : FALLBACK_LESSONS;
}

export async function getSipsContent() {
  const live = await getSips();
  return live.length > 0 ? live : FALLBACK_SIPS;
}

export async function getEditIssuesContent() {
  const live = await getEditIssues();
  return live.length > 0 ? live : FALLBACK_EDIT_ISSUES;
}

export async function getStyledContent() {
  const live = await getStyledCapsules();
  return live.length > 0 ? live : FALLBACK_STYLED;
}

export async function getCollectionsContent() {
  const live = await getShopCollections();
  const collections = live.filter((c) => c.type !== 'Kit Product');
  return collections.length > 0 ? collections : FALLBACK_COLLECTIONS;
}

export async function getFeaturedCollections() {
  const live = await getShopCollections({ featuredOnly: true });
  if (live.length > 0) return live.slice(0, 3);
  return FALLBACK_COLLECTIONS.filter((c) => c.featured).slice(0, 3);
}

export async function getShiftItemById(id) {
  const items = await getShiftFeedContent();
  return items.find((i) => i.id === id) || null;
}

export async function getLessonById(id) {
  const items = await getLessonsContent();
  return items.find((i) => i.id === id) || null;
}

export async function getSipById(id) {
  const items = await getSipsContent();
  return items.find((i) => i.id === id) || null;
}
