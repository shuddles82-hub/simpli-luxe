import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import LibraryPanel from '@/components/LibraryPanel';

export const metadata = {
  title: 'The Luxe Library · Simpli Luxe',
  description: 'Guides and downloads to support your soft life, all in one quiet shelf.',
};

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Members · Guides · Downloads"
        title="The Luxe"
        emphasis="Library"
        sub="A Quiet Shelf, Curated for You"
      />
      <LibraryPanel />
      <Footer series="The Luxe Library" />
    </>
  );
}
