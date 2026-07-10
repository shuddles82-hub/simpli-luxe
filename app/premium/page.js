import Footer from '@/components/Footer';
import QuoteBand from '@/components/QuoteBand';

export const metadata = {
  title: 'Styling Services · Simpli Luxe',
  description: 'A fully personalized style experience built around your life, your coloring, and your aesthetic.',
};

const KITS = [
  {
    id: 'brief',
    badge: '1:1 Personal Service',
    price: 67,
    name: ['The Simpli Luxe', 'Style Brief'],
    tagline: 'Your complete signature style identity',
    includes: [
      'Color analysis & personal color story',
      'Style identity. Your signature aesthetic defined',
      'Capsule formulas built for your actual lifestyle',
      'Silhouette guide. What works for your body',
      'Board collection. Visual styling reference',
    ],
    cta: 'Get Your Style Brief · $67',
    featured: true,
  },
  {
    id: 'blueprint',
    badge: '1:1 Personal Service · Most Popular',
    price: 127,
    name: ['The Simpli Luxe', 'Style Blueprint'],
    tagline: 'Your style brief + full capsule boards',
    includes: [
      'Everything in The Style Brief',
      'Full illustrated capsule board collection',
      'Style Brief PDF document delivered to you',
      'Personalized ShopMy shopping collection',
      'Your complete visual wardrobe system',
    ],
    cta: 'Get Your Blueprint · $127',
    featured: false,
    bestseller: true,
  },
  {
    id: 'collection',
    badge: 'The Complete Experience',
    price: 197,
    name: ['The Simpli Luxe', 'Full Collection'],
    tagline: 'Your complete style identity, all in one',
    includes: [
      'Everything in The Style Blueprint',
      'The Simpli Luxe Life Deck included',
      'Full capsule board collection. All seasons',
      'Shoppable wardrobe on ShopMy',
      'The complete Simpli Luxe style experience',
    ],
    cta: 'Get the Full Collection · $197',
    featured: true,
  },
];

const PROCESS = [
  {
    n: '01',
    title: 'Purchase',
    desc: "Choose your package and complete your purchase through Kit. You'll receive a confirmation immediately.",
  },
  {
    n: '02',
    title: 'Questionnaire',
    desc: 'Staci personally sends you the style questionnaire, covering your lifestyle, occasions, coloring, and aesthetic inspiration.',
  },
  {
    n: '03',
    title: 'Delivery',
    desc: 'Your complete style brief, capsule boards, and shoppable collection are built and delivered directly to you.',
  },
  {
    n: '04',
    title: 'Style with Confidence',
    desc: 'Your style brief becomes your daily reference. Dressing with intention, ease, and confidence every single day.',
  },
];

export default function PremiumPage() {
  return (
    <>
      <div className="ph2" style={{ minHeight: 'auto', padding: '64px 24px 52px' }}>
        <div className="pi">
          <div className="p-ey">Simpli Luxe · Personal Styling</div>
          <div className="p-icon">✦</div>
          <h1 className="p-title">
            Your Style, <em>Personalized.</em>
          </h1>
          <p className="p-sub">Curated by Staci · Limited Availability</p>
          <div className="p-div" />
          <p className="p-desc">
            A fully personalized style experience built around <em>your</em> life, your coloring,
            and your aesthetic. Choose the level that fits where you are, from your personal style
            brief to the complete collection.
          </p>
        </div>
      </div>

      <div style={{ padding: '0 3px 3px' }}>
        <div className="kit-grid">
          {KITS.map((kit) => (
            <div key={kit.id} className={`kit-card${kit.featured ? ' featured' : ''}`}>
              <div className="kit-card-inner">
                <div className="kit-badge">{kit.badge}</div>
                <div className="kit-price">
                  <sup>$</sup>
                  {kit.price}
                </div>
                <div className="kit-name">
                  {kit.name[0]}
                  <br />
                  {kit.name[1]}
                </div>
                <div className="kit-tagline">{kit.tagline}</div>
                <div className="kit-divider" />
                <ul className="kit-includes">
                  {kit.includes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                {kit.bestseller && <div className="kit-bestseller">Most Popular</div>}
                <button className="kit-cta">{kit.cta}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--ww)', padding: '52px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="sey" style={{ marginBottom: 6 }}>
            How It Works
          </div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontSize: 34,
              color: 'var(--obs)',
              marginBottom: 20,
            }}
          >
            The Simpli Luxe{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--taupe)' }}>Process</em>
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 2,
              background: 'var(--sb)',
            }}
          >
            {PROCESS.map((step) => (
              <div key={step.n} style={{ background: 'var(--ww)', padding: '24px 20px' }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontWeight: 300,
                    fontSize: 36,
                    color: 'rgba(201,169,110,0.15)',
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontWeight: 400,
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--obs)',
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Jost',sans-serif",
                    fontWeight: 300,
                    fontSize: 11,
                    color: 'var(--taupe)',
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuoteBand
        quote="A woman who commands a room without raising her voice. That is your aesthetic. That is the Simpli Luxe way."
        cite="Staci · Founder, Simpli Luxe"
      />
      <Footer series="Personal Styling Services" links={['Instagram', 'TikTok', 'YouTube']} />
    </>
  );
}
