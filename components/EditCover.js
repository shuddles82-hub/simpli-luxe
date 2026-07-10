const SEASON_CLASS = {
  Fall: 'bfall',
  Holiday: 'bhol',
  Winter: 'bwin',
  Spring: 'bspr',
  Summer: 'bsum',
};

function eraShort(era) {
  if (!era) return '';
  return era.replace(/^The /, 'The ').replace(' Era', '');
}

// One issue tile in The Simpli Edit grid. Live records with a cover
// Attachment render the image; otherwise a designed gradient cover is
// composed from the issue's fields (matching the reference tiles).
export default function EditCover({ issue }) {
  const seasonClass =
    issue.seasonClass || SEASON_CLASS[issue.season] || 'bnew';
  const volLabel =
    issue.volLabel ||
    (issue.volume ? `Vol ${String(issue.volume).padStart(2, '0')}${issue.season ? ` · ${issue.season}` : ''}` : '');
  const lines =
    issue.coverLines ||
    String(issue.title || '')
      .split(/(?<=\.)\s+/)
      .filter(Boolean)
      .map((text, i, arr) => ({
        text,
        color: i === arr.length - 1 ? 'var(--gold)' : 'var(--ww)',
      }));

  return (
    <div className="igt">
      {issue.cover ? (
        <img className="igt-img" src={issue.cover} alt={issue.title} />
      ) : (
        <div
          className="igt-bg"
          style={{
            background: issue.gradient || 'linear-gradient(155deg,#1a1408,#2a2010 50%,#1a1408)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--gold)',
              textAlign: 'center',
              marginBottom: 5,
            }}
          >
            THE SIMPLI EDIT
          </div>
          <div
            style={{
              fontFamily: "'Jost',sans-serif",
              fontWeight: 200,
              fontSize: 6,
              letterSpacing: '0.34em',
              color: 'rgba(201,169,110,0.36)',
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            {issue.miniLabel || volLabel}
          </div>
          <div
            style={{
              width: 66,
              height: 86,
              border: '1px solid rgba(201,169,110,0.17)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(201,169,110,0.04)',
              padding: 8,
              marginBottom: 9,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 9,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {lines.map((l, i) => (
                <span key={i}>
                  <span style={{ color: l.color, fontStyle: l.italic ? 'italic' : 'normal' }}>
                    {l.text}
                  </span>
                  {i < lines.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
          {(issue.script || issue.subtitle) && (
            <div
              style={{
                fontFamily: "'Dancing Script',cursive",
                fontSize: 10,
                color: 'rgba(253,250,245,0.32)',
              }}
            >
              {issue.script || `+ ${issue.subtitle}`}
            </div>
          )}
        </div>
      )}
      <div className="igt-ov" />
      {issue.isNew ? (
        <div className="sb-tag bnew">✦ New This Week</div>
      ) : (
        issue.season && <div className={`sb-tag ${seasonClass}`}>{issue.season}</div>
      )}
      {issue.eraShort || issue.era ? (
        <div className="era-tag">{issue.eraShort || eraShort(issue.era)}</div>
      ) : null}
      <div className="igt-inf">
        <div className="igt-v">{volLabel}</div>
        <div className="igt-t">{issue.title}</div>
      </div>
    </div>
  );
}
