import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import QuoteBand from '@/components/QuoteBand';
import InsiderExplorer from '@/components/InsiderExplorer';
import { getInsiderWeeklyContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'The Insider Hub · Simpli Luxe',
  description: 'Daily Affirmations, Money Monday, Wellness Wednesday, Weekend Luxury Guides, and Sunday Resets for Luxe Insiders.',
  openGraph: {
    title: 'The Insider Hub · Simpli Luxe',
    description: 'Daily Affirmations, Money Monday, Wellness Wednesday, Weekend Luxury Guides, and Sunday Resets for Luxe Insiders.',
  },
};

export default async function InsiderPage() {
  const items = await getInsiderWeeklyContent();

  return (
    <>
      <PageHeader
        eyebrow="Luxe Insider · Weekly Rhythms"
        title="The Insider"
        emphasis="Hub"
        sub="Daily Affirmations · Money Monday · Wellness Wednesday · Weekend Luxury Guides · Sunday Reset"
      />
      <InsiderExplorer items={items} />
      <QuoteBand
        style={{ marginTop: 3 }}
        quote="The becoming happens in the margins of a life that already feels good."
        cite="The Insider Hub · Simpli Luxe"
      />
      <Footer series="The Insider Hub" links={['Instagram', 'TikTok', 'Pinterest']} />
    </>
  );
}
