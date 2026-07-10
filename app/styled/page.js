import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import StyledExplorer from '@/components/StyledExplorer';
import { getStyledContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'Simpli Styled · Simpli Luxe',
  description: 'Capsule wardrobes, outfit formulas, and get-the-look guides, curated the luxe-for-less way.',
  openGraph: {
    title: 'Simpli Styled · Simpli Luxe',
    description: 'Capsule wardrobes, outfit formulas, and get-the-look guides, curated the luxe-for-less way.',
  },
};

export default async function StyledPage() {
  const boards = await getStyledContent();

  return (
    <>
      <PageHeader
        eyebrow="Fashion · Style · Get the Look"
        title="Simpli"
        emphasis="Styled"
        sub="Curated by Staci · Luxe for Less · Every Occasion"
      />
      <StyledExplorer boards={boards} />
      <Footer series="Simpli Styled" links={['ShopMy', 'LTK', 'Instagram']} />
    </>
  );
}
