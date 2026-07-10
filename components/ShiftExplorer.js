'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import ShiftCard from './ShiftCard';
import NoteToSelf from './NoteToSelf';

function tagsFor(item) {
  return [
    item.era,
    item.type === 'note' ? 'Note to Self' : null,
    item.journalingPrompt ? 'Journaling' : null,
  ].filter(Boolean);
}

export default function ShiftExplorer({ items }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(items.flatMap(tagsFor))];
  const visible = active ? items.filter((i) => tagsFor(i).includes(active)) : items;

  return (
    <>
      <FilterBar chips={chips} active={active} onChange={setActive} />
      <div className="sfd">
        {visible.map((item) =>
          item.type === 'note' ? (
            <NoteToSelf key={item.id} item={item} />
          ) : (
            <ShiftCard key={item.id} item={item} />
          )
        )}
        {visible.length === 0 && (
          <div className="empty">Nothing here yet. Something lovely is on the way.</div>
        )}
      </div>
    </>
  );
}
