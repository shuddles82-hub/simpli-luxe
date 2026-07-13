import Link from 'next/link';

function epLabel(item) {
  if (item.epLabel) return item.epLabel;
  if (item.episode) return `EP. ${String(item.episode).padStart(2, '0')}`;
  return 'Luxe Life Lessons';
}

export default function LessonCard({ item }) {
  const eraLine = [item.era, item.season].filter(Boolean).join(' · ');
  const excerpt =
    item.body && item.body.length > 260 ? `${item.body.slice(0, 257).trimEnd()}…` : item.body;
  return (
    <Link href={`/lessons/${item.id}`} className="lc" style={{ display: 'block' }}>
      {item.premium ? (
        <div className="lc-new" style={{ background: 'var(--obs)', color: 'var(--gold)' }}>
          ✦ Insider
        </div>
      ) : (
        item.isNew && <div className="lc-new">✦ New</div>
      )}
      <div className="lc-ep">{epLabel(item)}</div>
      {eraLine && <span className="lc-era">{eraLine}</span>}
      <h2 className="lc-title">{item.title}</h2>
      <div className="lc-exc">{excerpt}</div>
      <span className="lc-arr">→</span>
    </Link>
  );
}
