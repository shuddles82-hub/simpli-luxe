import Link from 'next/link';

function heroLines(c) {
  return String(c.heroTitle || c.name).split('\n');
}

// Shop collection card. `cta`/`ctaHref` let the homepage variant link
// to /shop while the shop page links out to ShopMy/LTK/Kit.
export default function CollectionCard({ collection, cta, ctaHref }) {
  const c = collection;
  const lines = heroLines(c);
  const tag = c.tag || [c.era, c.season].filter(Boolean).join(' · ') || c.category;
  const outLink = c.shopMyLink || c.ltkLink || c.kitLink || '';
  const label = cta || 'Shop on ShopMy →';

  const inner = (
    <>
      <div className={`coll-card-hero ${c.image ? '' : c.heroClass || 'cbg1'}`}>
        {c.image && <img className="coll-card-hero-img" src={c.image} alt={c.name} />}
        <div className="coll-card-hero-title">
          {lines.map((l, i) => (
            <span key={i}>
              {l}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
      <div className="coll-meta">
        <div className="coll-tag">{tag}</div>
        <div className="coll-name">{c.name}</div>
        <div className="coll-desc">{c.description}</div>
        {ctaHref ? (
          <Link href={ctaHref} className="coll-cta">
            {label}
          </Link>
        ) : (
          <a href={outLink || '#'} className="coll-cta" target={outLink ? '_blank' : undefined} rel={outLink ? 'noreferrer' : undefined}>
            {label}
          </a>
        )}
      </div>
    </>
  );

  return <div className="coll-card">{inner}</div>;
}
