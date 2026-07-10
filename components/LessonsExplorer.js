'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import LessonCard from './LessonCard';

function tagsFor(item) {
  return [item.category, item.era].filter(Boolean);
}

export default function LessonsExplorer({ items }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(items.flatMap(tagsFor))];
  const visible = active ? items.filter((i) => tagsFor(i).includes(active)) : items;

  return (
    <>
      <FilterBar allLabel="All Lessons" chips={chips} active={active} onChange={setActive} />
      <div className="lgrid">
        {visible.map((item) => (
          <LessonCard key={item.id} item={item} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
