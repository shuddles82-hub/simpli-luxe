import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ShiftCard from '@/components/ShiftCard';
import NoteToSelf from '@/components/NoteToSelf';
import { getShiftItemById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getShiftItemById(id);
  if (!item) return { title: 'Soft Life Shift · Simpli Luxe' };
  const title =
    item.type === 'note' ? 'Note to Self · Simpli Luxe' : `${item.title} · Soft Life Shift`;
  const description = String(item.body || item.quote || '').slice(0, 160);
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

export default async function ShiftDetailPage({ params }) {
  const { id } = await params;
  const item = await getShiftItemById(id);
  if (!item) notFound();

  return (
    <>
      <div className="ph" style={{ padding: '46px 24px 38px' }}>
        <div className="ph-ey">Soft Life Shift</div>
        <h1 className="ph-t" style={{ fontSize: 34 }}>
          {item.type === 'note' ? (
            <>
              Note to <em>Self</em>
            </>
          ) : (
            item.title
          )}
        </h1>
        {(item.era || item.season) && (
          <p className="ph-s">{[item.era, item.season].filter(Boolean).join(' · ')}</p>
        )}
      </div>
      <div className="sfd">
        {item.type === 'note' ? <NoteToSelf item={item} /> : <ShiftCard item={item} />}
        <div style={{ padding: '18px 0', textAlign: 'center' }}>
          <Link className="fc" href="/shift" style={{ display: 'inline-block' }}>
            ← All Soft Life Shifts
          </Link>
        </div>
      </div>
      <Footer series="Soft Life Shift" />
    </>
  );
}
