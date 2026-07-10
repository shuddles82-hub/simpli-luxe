import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import QuoteBand from '@/components/QuoteBand';
import LessonsExplorer from '@/components/LessonsExplorer';
import { getLessonsContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'Luxe Life Lessons · Simpli Luxe',
  description: 'The philosophies behind the soft life, with Staci.',
  openGraph: {
    title: 'Luxe Life Lessons · Simpli Luxe',
    description: 'The philosophies behind the soft life, with Staci.',
  },
};

export default async function LessonsPage() {
  const lessons = await getLessonsContent();

  return (
    <>
      <PageHeader
        eyebrow="Teaching · Wisdom · Philosophy"
        title="Luxe Life"
        emphasis="Lessons"
        sub="The philosophies behind the soft life, with Staci"
      />
      <LessonsExplorer items={lessons} />
      <QuoteBand
        style={{ marginTop: 3 }}
        quote="Luxury is choosing the pace that honors you."
        cite="Luxe Life Lessons, EP. 01 · Simpli Luxe"
      />
      <Footer series="Luxe Life Lessons" links={['YouTube', 'TikTok', 'Instagram']} />
    </>
  );
}
