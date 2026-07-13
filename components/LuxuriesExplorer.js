'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import LuxuryCard from './LuxuryCard';

function tagsFor(item) {
  return [item.category].filter(Boolean);
}

export default function LuxuriesExplorer({ items }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(items.flatMap(tagsFor))];
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
