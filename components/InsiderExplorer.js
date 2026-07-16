'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import InsiderCard from './InsiderCard';
import { INSIDER_PILLARS } from '@/lib/fallback';

function tagsFor(item) {
  return [item.pillar].filter(Boolean);
}

export default function InsiderExplorer({ items }) {
  const [active, setActive] = useState(null);
  const extra = [...new Set(items.flatMap(tagsFor))].filter((p) => !INSIDER_PILLARS.includes(p));
  const chips = [...INSIDER_PILLARS, ...extra];
  const visible = active ? items.filter((i) => tagsFor(i).includes(active)) : items;

  return (
    <>
      <FilterBar allLabel="All Pillars" chips={chips} active={active} onChange={setActive} />
      <div className="lgrid">
        {visible.map((item) => (
          <InsiderCard key={item.id} item={item} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
