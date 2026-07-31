import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import SaveButton from '@/components/SaveButton';
import ShareRow from '@/components/ShareRow';
import { linkify } from '@/components/RichText';
import { getLuxeCodeById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getLuxeCodeById(id);
  if (!item) return { title: 'The Luxe Code · Simpli Luxe' };
  const title = `${item.title} · The Luxe Code`;
  const description = String(item.formula || '').slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(item.image ? { images: [item.image] } : {}),
    },
  };
}

export default async function LuxeCodeDetailPage({ params }) {
  const { id } = await params;
  const item = await getLuxeCodeById(id);
  if (!item) notFound();

  return (
    <>
      <div className="rmh" style={{ position: 'static' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="rm-tag">
              {item.episode ? `EP. ${String(item.episode).padStart(2, '0')}` : 'The Luxe Code'}
            </div>
            {item.category && <span className="sip-b">{item.category}</span>}
          </div>
          <div className="rm-title">{item.title}</div>
          {item.hook && (
            <div
              style={{
                fontFamily: "'Dancing Script',cursive",
                fontSize: 15,
                color: 'rgba(201,169,110,0.7)',
                marginTop: 5,
              }}
            >
              {item.hook}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SaveButton
            contentKey={item.id}
            series="The Luxe Code"
            title={item.title}
            href={`/luxe-code/${item.id}`}
          />
          <ShareRow path={`/luxe-code/${item.id}`} title={item.title} text={item.formula} image={item.image} />
          <Link className="rm-close" href="/luxe-code">
            ← All Episodes
          </Link>
        </div>
      </div>
      <div className="rcrd">
        {item.image && (
          <img className="recipe-hero" src={item.image} alt={item.title} style={{ marginBottom: 20 }} />
        )}
        {item.quote && (
          <div className="sh-q" style={{ margin: '0 0 20px' }}>
            <p>{item.quote}</p>
          </div>
        )}
        {item.formulaSteps?.length > 0 && (
          <div className="rbd">
            <div className="rfl">
              <div className="rfl-l">The Formula</div>
              <ul className="rl">
                {item.formulaSteps.map((step, i) => (
                  <li key={i}>{linkify(step)}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {item.formulaCardImage && (
          <figure style={{ marginTop: 24 }}>
            <img
              src={item.formulaCardImage}
              alt={`${item.title} formula card`}
              style={{ width: '100%', display: 'block' }}
            />
            <figcaption
              style={{
                fontFamily: "'Jost',sans-serif",
                fontWeight: 400,
                fontSize: 8,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              The Formula
            </figcaption>
          </figure>
        )}
        {item.shopLink && (
          <div style={{ marginTop: 24 }}>
            <a href={item.shopLink} target="_blank" rel="noreferrer" className="acc-btn">
              Shop This Look →
            </a>
          </div>
        )}
      </div>
      <Footer series="The Luxe Code" links={['Instagram', 'TikTok', 'ShopMy']} />
    </>
  );
}
