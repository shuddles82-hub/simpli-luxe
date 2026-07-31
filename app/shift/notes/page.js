import Link from 'next/link';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import NoteToSelf from '@/components/NoteToSelf';
import { getShiftFeedContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'Notes to Self · Soft Life Shift · Simpli Luxe',
  description: 'Quiet reminders from Soft Life Shift, all in one place.',
};

export default async function NotesToSelfPage() {
  const feed = await getShiftFeedContent();
  const notes = feed.filter((item) => item.type === 'note');

  return (
    <>
      <PageHeader
        eyebrow="Soft Life Shift"
        title="Notes to"
        emphasis="Self"
        sub="Quiet reminders, all in one place."
      />
      <div className="sfd">
        {notes.map((item) => (
          <NoteToSelf key={item.id} item={item} />
        ))}
        {notes.length === 0 && (
          <div className="empty">Nothing here yet. Something lovely is on the way.</div>
        )}
      </div>
      <div style={{ padding: '18px 0', textAlign: 'center' }}>
        <Link className="fc" href="/shift" style={{ display: 'inline-block' }}>
          ← All of Soft Life Shift
        </Link>
      </div>
      <Footer series="Soft Life Shift" />
    </>
  );
}
