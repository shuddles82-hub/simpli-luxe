import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import AccountPanel from '@/components/AccountPanel';

export const metadata = {
  title: 'Members · Simpli Luxe',
  description: 'Your profile and everything you have saved for later.',
};

export default function AccountPage() {
  return (
    <>
      <PageHeader
        eyebrow="Simpli Luxe Members"
        title="Your Soft Life,"
        emphasis="Saved"
        sub="Profile · Saved Content · Preferences"
      />
      <AccountPanel />
      <Footer series="Members" />
    </>
  );
}
