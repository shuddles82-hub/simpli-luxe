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

  const outLink = item.shopMyLink || item.ltkLink || '';
  const storeName = item.shopMyLink ? 'ShopMy' : item.ltkLink ? 'LTK' : 'ShopMy';

  return (
    <>
      <div className="rmh" style={{ position: 'static' }}>
        <div>
          <div className="rm-tag">
            {item.episode ? `EP. ${String(item.episode).padStart(2, '0')}` : 'The Luxe Code'}
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
        {item.formula && (
          <div className="rbd">
            <div className="rfl">
              <div className="rfl-l">The Formula</div>
              <div className="rfl-t">{linkify(item.formula)}</div>
            </div>
          </div>
        )}
        {outLink && (
          <div style={{ marginTop: 24 }}>
            <a href={outLink} target="_blank" rel="noreferrer" className="acc-btn">
              Shop on {storeName} →
            </a>
          </div>
        )}
      </div>
      <Footer series="The Luxe Code" links={['Instagram', 'TikTok', 'ShopMy']} />
    </>
  );
}
