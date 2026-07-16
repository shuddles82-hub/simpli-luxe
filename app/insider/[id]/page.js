import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import QuoteBand from '@/components/QuoteBand';
import InsiderDetailGate from '@/components/InsiderDetailGate';
import { getInsiderItemById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getInsiderItemById(id);
  if (!item) return { title: 'The Insider Hub · Simpli Luxe' };
  const title = `${item.title} · ${item.pillar || 'Insider Weekly'}`;
  return { title };
}

export default async function InsiderDetailPage({ params }) {
  const { id } = await params;
  const item = await getInsiderItemById(id);
  if (!item) notFound();

  return (
    <>
      <div className="ph" style={{ padding: '46px 24px 38px' }}>
        <div className="ph-ey">{item.pillar || 'Insider Weekly'}</div>
        <h1 className="ph-t" style={{ fontSize: 34 }}>
          {item.title}
        </h1>
      </div>
      <div className="sfd">
        <article className="shc">
          <div className="shh">
            <InsiderDetailGate item={item} />
          </div>
        </article>
        <div style={{ padding: '18px 0', textAlign: 'center' }}>
          <Link className="fc" href="/insider" style={{ display: 'inline-block' }}>
            ← The Insider Hub
          </Link>
        </div>
      </div>
      <QuoteBand
        quote="The becoming happens in the margins of a life that already feels good."
        cite="The Insider Hub · Simpli Luxe"
      />
      <Footer series="The Insider Hub" links={['Instagram', 'TikTok', 'Pinterest']} />
    </>
  );
}
