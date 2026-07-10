import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import PlannerPanel from '@/components/PlannerPanel';

export const metadata = {
  title: 'The Luxe Planner · Simpli Luxe',
  description: 'Gentle habits, a soft journal, and your weekly reset, all in one quiet place.',
};

export default function PlannerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Members · Rituals · Rhythm"
        title="The Luxe"
        emphasis="Planner"
        sub="Gentle Habits · Weekly Reset · The Soft Journal"
      />
      <PlannerPanel />
      <Footer series="The Luxe Planner" />
    </>
  );
}
