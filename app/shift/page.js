import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ShiftExplorer from '@/components/ShiftExplorer';
import { getShiftFeedContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'Soft Life Shift · Simpli Luxe',
  description: 'Your weekly intentional living moment, curated softly.',
  openGraph: {
    title: 'Soft Life Shift · Simpli Luxe',
    description: 'Your weekly intentional living moment, curated softly.',
  },
};

export default async function ShiftPage() {
  const feed = await getShiftFeedContent();

  return (
    <>
      <PageHeader
        eyebrow="Mindset · Intentional Living"
        title="Soft Life"
        emphasis="Shift"
        sub="Your weekly intentional living moment, curated softly."
      />
      <ShiftExplorer items={feed} />
      <Footer series="Soft Life Shift" />
    </>
  );
}
