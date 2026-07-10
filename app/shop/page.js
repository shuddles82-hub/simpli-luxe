import Link from 'next/link';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import QuoteBand from '@/components/QuoteBand';
import CollectionsExplorer from '@/components/CollectionsExplorer';
import { getCollectionsContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'Shop · Simpli Luxe',
  description: 'Collections, digital products, and styling services, curated by Staci.',
};

const DIGITAL_PRODUCTS = [
  {
    id: 'brief',
    badge: 'Entry',
    service: '1:1 Personal Service',
    price: '$67',
    name: 'The Style Brief',
    desc: 'Color analysis, style identity, capsule formulas, silhouette guide & board collection.',
    cta: 'Get Your Style Brief',
    boxed: true,
  },
  {
    id: 'blueprint',
    badge: 'Popular',
    service: '1:1 Personal Service',
    price: '$127',
    name: 'The Style Blueprint',
    desc: 'Style Brief + full capsule boards + personalized ShopMy shopping collection.',
    cta: 'Get Your Blueprint',
    boxed: false,
  },
  {
    id: 'collection',
    badge: 'Complete',
    service: 'Full Experience',
    price: '$197',
    name: 'The Full Collection',
    desc: 'Everything. Blueprint + Life Deck + all capsule boards + shoppable wardrobe. Your complete style identity.',
    cta: 'Get the Full Collection',
    boxed: true,
  },
];

export default async function ShopPage() {
  const collections = await getCollectionsContent();

  return (
    <>
      <PageHeader
        eyebrow="ShopMy · LTK · Kit · Curated by Staci"
        title="Shop Simpli"
        emphasis="Luxe"
        sub="Collections · Digital Products · Styling Services"
      />
      <div style={{ padding: '40px 24px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div className="sey" style={{ marginBottom: 5 }}>
          Digital Products · Kit
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 300,
            fontSize: 30,
            color: 'var(--obs)',
            marginBottom: 4,
          }}
        >
          Simpli Luxe <em style={{ fontStyle: 'italic', color: 'var(--taupe)' }}>Products</em>
        </h3>
        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontWeight: 300,
            fontSize: 12,
            color: 'var(--taupe)',
            lineHeight: 1.8,
          }}
        >
          Digital downloads and 1:1 services. Your style and soft life, elevated.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 3,
          padding: 3,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {DIGITAL_PRODUCTS.map((p) => (
          <div
            key={p.id}
            style={{
              background: p.boxed ? 'linear-gradient(160deg,#0d0d0d,#1a1408)' : 'var(--obs)',
              border: p.boxed ? '1px solid rgba(201,169,110,0.18)' : 'none',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                fontFamily: "'Jost',sans-serif",
                fontWeight: 400,
                fontSize: 7,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--obs)',
                background: 'var(--gold)',
                padding: '4px 8px',
              }}
            >
              {p.badge}
            </div>
            <div
              style={{
                fontFamily: "'Jost',sans-serif",
                fontWeight: 300,
                fontSize: 7,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              {p.service}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 600,
                fontSize: 28,
                color: 'var(--gold)',
                lineHeight: 1,
              }}
            >
              {p.price}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontWeight: 500,
                fontSize: 17,
                color: 'var(--ww)',
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontFamily: "'Jost',sans-serif",
                fontWeight: 300,
                fontSize: 11,
                color: 'rgba(253,250,245,0.5)',
                lineHeight: 1.65,
                flex: 1,
              }}
            >
              {p.desc}
            </div>
            <Link href="/premium" className="kit-cta">
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <div style={{ padding: '48px 24px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div className="sey" style={{ marginBottom: 5 }}>
          Shop on ShopMy · Curated by Staci
        </div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontWeight: 300,
            fontSize: 30,
            color: 'var(--obs)',
            marginBottom: 4,
          }}
        >
          Style <em style={{ fontStyle: 'italic', color: 'var(--taupe)' }}>Collections</em>
        </h3>
        <p
          style={{
            fontFamily: "'Jost',sans-serif",
            fontWeight: 300,
            fontSize: 12,
            color: 'var(--taupe)',
            lineHeight: 1.8,
          }}
        >
          Every collection is shoppable on ShopMy. Curated with intention, updated regularly.
        </p>
      </div>
      <CollectionsExplorer collections={collections} />

      <QuoteBand
        style={{ marginTop: 3 }}
        quote="Luxury doesn't have to be expensive. It just has to be intentional."
        cite="Staci · Founder, Simpli Luxe"
      />
      <Footer series="Shop" links={['ShopMy', 'LTK', 'Kit', 'Instagram']} />
    </>
  );
}
