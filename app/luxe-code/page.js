import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import QuoteBand from '@/components/QuoteBand';
import LuxeCodeExplorer from '@/components/LuxeCodeExplorer';
import { getLuxeCodeContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'The Luxe Code · Simpli Luxe',
  description: 'The flagship weekly series. A new formula every week, with Staci.',
  openGraph: {
    title: 'The Luxe Code · Simpli Luxe',
    description: 'The flagship weekly series. A new formula every week, with Staci.',
  },
};

export default async function LuxeCodePage() {
  const items = await getLuxeCodeContent();

  return (
    <>
      <PageHeader
        eyebrow="Simpli Luxe's Flagship Series · Weekly"
        title="The Luxe"
        emphasis="Code"
        sub="A New Formula Every Week · With Staci"
      />
      <LuxeCodeExplorer items={items} />
      <QuoteBand
        style={{ marginTop: 3 }}
        quote="Luxury is a formula you can actually repeat."
        cite="The Luxe Code · Simpli Luxe"
      />
      <Footer series="The Luxe Code" links={['Instagram', 'TikTok', 'ShopMy']} />
    </>
  );
}
