'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import LuxuryCard from './LuxuryCard';
import { LUXURY_CATEGORIES } from '@/lib/fallback';

function tagsFor(item) {
  return [item.category].filter(Boolean);
}

export default function LuxuriesExplorer({ items }) {
  const [active, setActive] = useState(null);
  // Fixed categories (matching the homepage teaser) plus any extra
  // category a live Airtable record might use that isn't in that list,
  // so a filter tab always exists even before content is published in it.
  const extra = [...new Set(items.flatMap(tagsFor))].filter(
    (c) => !LUXURY_CATEGORIES.includes(c)
  );
  const chips = [...LUXURY_CATEGORIES, ...extra];
  const visible = active ? items.filter((i) => tagsFor(i).includes(active)) : items;

  return (
    <>
      <FilterBar allLabel="All Moments" chips={chips} active={active} onChange={setActive} />
      <div className="lux-grid">
        {visible.map((item) => (
          <LuxuryCard key={item.id} item={item} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
