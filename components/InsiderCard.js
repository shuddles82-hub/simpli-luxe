import Link from 'next/link';

export default function InsiderCard({ item }) {
  const excerpt =
    item.body && item.body.length > 220 ? `${item.body.slice(0, 217).trimEnd()}…` : item.body;
  return (
    <Link href={`/insider/${item.id}`} className="lc" style={{ display: 'block' }}>
      {item.premium ? (
        <div className="lc-new" style={{ background: 'var(--obs)', color: 'var(--gold)' }}>
          ✦ Insider
        </div>
      ) : (
        item.isNew && <div className="lc-new">✦ New</div>
      )}
      <div className="lc-ep">{item.pillar || 'Insider Weekly'}</div>
      <h2 className="lc-title">{item.title}</h2>
      {item.quote ? (
        <div className="lc-exc" style={{ fontStyle: 'italic' }}>
          &ldquo;{item.quote}&rdquo;
        </div>
      ) : (
        <div className="lc-exc">{excerpt}</div>
      )}
      <span className="lc-arr">→</span>
    </Link>
  );
}
