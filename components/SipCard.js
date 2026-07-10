import Link from 'next/link';

function heroLines(sip) {
  const source = sip.heroTitle || sip.title;
  return String(source).split('\n');
}

function epLabel(sip) {
  if (sip.epLabel) return sip.epLabel;
  if (sip.episode) return `EP. ${String(sip.episode).padStart(2, '0')}`;
  return 'The Simpli Sip';
}

export default function SipCard({ sip }) {
  const lines = heroLines(sip);
  const badges = [sip.season, sip.eraShort || sip.era, ...(sip.flavorTags || [])].filter(Boolean);
  return (
    <Link href={`/sip/${sip.id}`} className="sipc" style={{ display: 'block' }}>
      <div className={`siph ${sip.image ? '' : sip.heroClass || 'bgnew'}`}>
        {sip.image ? (
          // The uploaded recipe card is a designed image with its own
          // title; overlaying text on it reads doubled.
          <img className="siph-img" src={sip.image} alt={sip.title} />
        ) : (
          <div className="siph-t">
            {lines.map((l, i) => (
              <span key={i}>
                {l}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="sipm">
        <div className="sip-ep">
          {sip.isNew ? '✦ NEW · ' : ''}
          {epLabel(sip)}
        </div>
        <div className="sip-nm">{sip.title}</div>
        {sip.vibe && <div className="sip-vb">{sip.vibe}</div>}
        {badges.length > 0 && (
          <div className="sip-bs">
            {badges.map((b) => (
              <span key={b} className="sip-b">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
