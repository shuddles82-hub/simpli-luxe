'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import CollectionCard from './CollectionCard';

function tagsFor(c) {
  if (c.filterTags) return c.filterTags;
  return [c.category, c.type].filter(Boolean);
}

export default function CollectionsExplorer({ collections }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(collections.flatMap(tagsFor))];
  const visible = active ? collections.filter((c) => tagsFor(c).includes(active)) : collections;

  return (
    <>
      {chips.length > 0 && (
        <FilterBar allLabel="All Collections" chips={chips} active={active} onChange={setActive} />
      )}
      <div className="coll-grid">
        {visible.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
