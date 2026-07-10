import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import SipExplorer from '@/components/SipExplorer';
import { getSipsContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'The Simpli Sip · Simpli Luxe',
  description: 'Simple ingredients. Quiet luxury. Ritual in a glass.',
  openGraph: {
    title: 'The Simpli Sip · Simpli Luxe',
    description: 'Simple ingredients. Quiet luxury. Ritual in a glass.',
  },
};

export default async function SipPage() {
  const sips = await getSipsContent();

  return (
    <>
      <PageHeader
        eyebrow="Mocktails · Rituals · Simpli Sips"
        title="The Simpli"
        emphasis="Sip"
        sub="Simple ingredients. Quiet luxury. Ritual in a glass."
      />
      <SipExplorer sips={sips} />
      <Footer series="The Simpli Sip" />
    </>
  );
}
