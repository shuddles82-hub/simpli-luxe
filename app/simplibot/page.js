import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import SimpliBotPanel from '@/components/SimpliBotPanel';

export const metadata = {
  title: 'SimpliBot · Simpli Luxe',
  description: 'Your soft life coach, in the Simpli Luxe voice. A quiet conversation, anytime.',
};

export default function SimpliBotPage() {
  return (
    <>
      <PageHeader
        eyebrow="Members · Soft Life Coach"
        title="Meet"
        emphasis="SimpliBot"
        sub="A Quiet Conversation · In Staci's Voice · Anytime"
      />
      <SimpliBotPanel />
      <Footer series="SimpliBot" />
    </>
  );
}
