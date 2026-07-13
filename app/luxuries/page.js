import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import QuoteBand from '@/components/QuoteBand';
import LuxuriesExplorer from '@/components/LuxuriesExplorer';
import { getLuxuriesContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: "Life's Little Luxuries · Simpli Luxe",
  description: 'The small moments that make life feel elevated, with Staci.',
  openGraph: {
    title: "Life's Little Luxuries · Simpli Luxe",
    description: 'The small moments that make life feel elevated, with Staci.',
  },
};

export default async function LuxuriesPage() {
  const items = await getLuxuriesContent();

  return (
    <>
      <PageHeader
        eyebrow="Simpli Luxe's Biggest Series"
        title="Life's Little"
        emphasis="Luxuries"
        sub="The Small Moments That Make Life Feel Elevated · With Staci"
      />
      <LuxuriesExplorer items={items} />
      <QuoteBand
        style={{ marginTop: 3 }}
        quote="Luxury is choosing presence over perfection, every single day."
        cite="Life's Little Luxuries · Simpli Luxe"
      />
      <Footer series="Life's Little Luxuries" links={['Instagram', 'TikTok', 'Pinterest']} />
    </>
  );
}
