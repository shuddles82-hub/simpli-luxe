'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import SipCard from './SipCard';

function tagsFor(sip) {
  return [sip.season, ...(sip.flavorTags || [])].filter(Boolean);
}

export default function SipExplorer({ sips }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(sips.flatMap(tagsFor))];
  const visible = active ? sips.filter((s) => tagsFor(s).includes(active)) : sips;

  return (
    <>
      <FilterBar allLabel="All Sips" chips={chips} active={active} onChange={setActive} />
      <div className="sipg">
        {visible.map((sip) => (
          <SipCard key={sip.id} sip={sip} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
