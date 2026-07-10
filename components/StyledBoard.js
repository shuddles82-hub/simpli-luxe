// Capsule board tile on the Simpli Styled page.
export default function StyledBoard({ board }) {
  const tag = board.tag || [board.category, board.season].filter(Boolean).join(' · ');
  const lookCount =
    board.lookCount || (board.formulas?.length ? `${board.formulas.length} Looks` : '');
  const hasSeasonTag = Boolean(board.seasonTag);
  return (
    <div className="bt">
      {board.image ? (
        <img className="bt-img" src={board.image} alt={board.name} />
      ) : (
        <div className={`bt-bg ${board.boardClass || 'bsig'}`} />
      )}
      <div className="bt-pat" />
      <div className="bt-ov" />
      {hasSeasonTag && (
        <div className={`sb-tag ${board.seasonClass || 'bnew'}`} style={{ top: 11, left: 11 }}>
          {board.seasonTag}
        </div>
      )}
      {board.eraShort && <div className="era-tag">{board.eraShort}</div>}
      {lookCount && (
        <div className="bt-lk" style={hasSeasonTag ? { top: 34 } : undefined}>
          {lookCount}
        </div>
      )}
      <div className="bt-ar">↗</div>
      <div className="bt-cnt">
        <div className="bt-tag">{tag}</div>
        <div className="bt-title">{board.name}</div>
        {board.tagline && <div className="bt-sub">{board.tagline}</div>}
        {board.palette?.length > 0 && (
          <div className="bt-pal">
            {board.palette.map((c) => (
              <div key={c} className="sw" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
