import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import EditExplorer from '@/components/EditExplorer';
import { getEditIssuesContent } from '@/lib/content';

export const revalidate = 600;

export const metadata = {
  title: 'The Simpli Edit · Simpli Luxe',
  description: 'Your curated guide to affordable luxury, soft living, and intentional style.',
  openGraph: {
    title: 'The Simpli Edit · Simpli Luxe',
    description: 'Your curated guide to affordable luxury, soft living, and intentional style.',
  },
};

export default async function EditPage() {
  const issues = await getEditIssuesContent();

  return (
    <>
      <PageHeader
        eyebrow="Digital Magazine"
        title="The Simpli"
        emphasis="Edit"
        sub="Luxury for Less · Soft Goals · Intentional Living · All 7 Vols"
      />
      <EditExplorer issues={issues} />
      <Footer series="The Simpli Edit" links={['Instagram', 'TikTok', 'LTK']} />
    </>
  );
}
