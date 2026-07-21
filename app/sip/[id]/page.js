import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import SaveButton from '@/components/SaveButton';
import ShareRow from '@/components/ShareRow';
import { sipTagLine } from '@/components/SipRecipe';
import SipDetailGate from '@/components/SipDetailGate';
import { getSipById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sip = await getSipById(id);
  if (!sip) return { title: 'The Simpli Sip · Simpli Luxe' };
  const title = `${sip.title} · The Simpli Sip`;
  const description = String(sip.flavorProfile || sip.vibe || '').slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(sip.image ? { images: [sip.image] } : {}),
    },
  };
}

export default async function SipDetailPage({ params }) {
  const { id } = await params;
  const sip = await getSipById(id);
  if (!sip) notFound();

  return (
    <>
      <div className="rmh" style={{ position: 'static' }}>
        <div>
          <div className="rm-tag">{sipTagLine(sip)}</div>
          <div className="rm-title">{sip.title}</div>
          {sip.vibe && (
            <div
              style={{
                fontFamily: "'Dancing Script',cursive",
                fontSize: 15,
                color: 'rgba(201,169,110,0.7)',
                marginTop: 5,
              }}
            >
              {sip.vibe}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SaveButton
            contentKey={sip.id}
            series="The Simpli Sip"
            title={sip.title}
            href={`/sip/${sip.id}`}
          />
          <ShareRow
            path={`/sip/${sip.id}`}
            title={sip.title}
            text={sip.premium ? sip.vibe : sip.flavorProfile || sip.vibe}
            image={sip.image}
            premium={sip.premium}
          />
          <Link className="rm-close" href="/sip">
            ← Back to Sips
          </Link>
        </div>
      </div>
      <div className="rcrd">
        <SipDetailGate sip={sip} />
      </div>
      <Footer series="The Simpli Sip" />
    </>
  );
}
