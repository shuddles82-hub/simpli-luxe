'use client';

import { useState } from 'react';
import FilterBar from './FilterBar';
import StyledBoard from './StyledBoard';

function tagsFor(board) {
  return [
    board.category,
    board.seasonTag || board.season,
    board.eraShort || board.era,
  ].filter(Boolean);
}

export default function StyledExplorer({ boards }) {
  const [active, setActive] = useState(null);
  const chips = [...new Set(boards.flatMap(tagsFor))];
  const visible = active ? boards.filter((b) => tagsFor(b).includes(active)) : boards;

  return (
    <>
      <FilterBar allLabel="All Looks" chips={chips} active={active} onChange={setActive} />
      <div className="bg2">
        {visible.map((board) => (
          <StyledBoard key={board.id} board={board} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
