import Link from 'next/link';

function epLabel(item) {
  return item.episode ? `EP. ${String(item.episode).padStart(2, '0')}` : 'The Luxe Code';
}

// One weekly episode. Mirrors LuxuryCard's cover-image-plus-body layout
// (Life's Little Luxuries) rather than the plain text LessonCard, since
// every episode carries a real cover image.
export default function LuxeCodeCard({ item }) {
  const excerpt =
    item.formula && item.formula.length > 220 ? `${item.formula.slice(0, 217).trimEnd()}…` : item.formula;

  return (
    <Link href={`/luxe-code/${item.id}`} className="code-c" style={{ display: 'block' }}>
      {item.image && (
        <div className="code-cover">
          <img className="code-cover-media" src={item.image} alt={item.title} />
        </div>
      )}
      <div className="lux-body">
        {item.isNew && <div className="lux-new">✦ New This Week</div>}
        <div className="lux-cat">{epLabel(item)}</div>
        <h3 className="lux-title">{item.title}</h3>
        {item.hook && <div className="sip-vb">{item.hook}</div>}
        {excerpt && <p className="lux-text">{excerpt}</p>}
      </div>
    </Link>
  );
}
