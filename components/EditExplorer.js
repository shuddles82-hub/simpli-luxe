'use client';

import { useState } from 'react';
import Link from 'next/link';
import FilterBar from './FilterBar';
import EditCover from './EditCover';

function eraLabel(issue) {
  if (issue.eraShort) return `${issue.eraShort} Era`;
  return issue.era || null;
}

function tagsFor(issue) {
  return [issue.season, eraLabel(issue)].filter(Boolean);
}

export default function EditExplorer({ issues }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(issues.flatMap(tagsFor))];
  const visible = active ? issues.filter((i) => tagsFor(i).includes(active)) : issues;

  return (
    <>
      <FilterBar allLabel="All Issues" chips={chips} active={active} onChange={setActive} />
      <div className="igg">
        {visible.map((issue) => (
          <Link key={issue.id} href={`/edit/${issue.id}`} style={{ display: 'block' }}>
            <EditCover issue={issue} />
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
