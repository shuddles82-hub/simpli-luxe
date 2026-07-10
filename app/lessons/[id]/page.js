import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import QuoteBand from '@/components/QuoteBand';
import SaveButton from '@/components/SaveButton';
import { getLessonById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getLessonById(id);
  if (!item) return { title: 'Luxe Life Lessons · Simpli Luxe' };
  const title = `${item.title} · Luxe Life Lessons`;
  const description = String(item.body || '').slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(item.image ? { images: [item.image] } : {}),
    },
  };
}

function BodyParagraphs({ text }) {
  const paras = String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p, i) => <p key={i}>{p}</p>);
}

export default async function LessonDetailPage({ params }) {
  const { id } = await params;
  const item = await getLessonById(id);
  if (!item) notFound();

  const subLine = [
    item.epLabel || (item.episode ? `EP. ${String(item.episode).padStart(2, '0')}` : ''),
    item.era,
    item.season,
    item.category,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <div className="ph" style={{ padding: '46px 24px 38px' }}>
        <div className="ph-ey">Luxe Life Lessons</div>
        <h1 className="ph-t" style={{ fontSize: 34 }}>
          {item.title}
        </h1>
        {subLine && <p className="ph-s">{subLine}</p>}
      </div>
      <div className="sfd">
        <article className="shc">
          <div className="shh">
            {item.subtitle && <div className="sh-script">{item.subtitle}</div>}
            <div className="sh-body">
              <BodyParagraphs text={item.body} />
            </div>
            <div style={{ marginTop: 12 }}>
              <SaveButton
                contentKey={item.id}
                series="Luxe Life Lessons"
                title={item.title}
                href={`/lessons/${item.id}`}
              />
            </div>
          </div>
          {item.quote && (
            <div className="sh-q">
              <p>&ldquo;{item.quote}&rdquo;</p>
            </div>
          )}
        </article>
        <div style={{ padding: '18px 0', textAlign: 'center' }}>
          <Link className="fc" href="/lessons" style={{ display: 'inline-block' }}>
            ← All Luxe Life Lessons
          </Link>
        </div>
      </div>
      <QuoteBand
        quote="Luxury is choosing the pace that honors you."
        cite="Luxe Life Lessons · Simpli Luxe"
      />
      <Footer series="Luxe Life Lessons" links={['YouTube', 'TikTok', 'Instagram']} />
    </>
  );
}
