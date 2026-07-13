import Link from 'next/link';
import Footer from '@/components/Footer';
import QuoteBand from '@/components/QuoteBand';
import HeroQuotes from '@/components/HeroQuotes';
import CollectionCard from '@/components/CollectionCard';
import { getFeaturedCollections } from '@/lib/content';

export const revalidate = 600;

const SERIES = [
  {
    href: '/edit',
    n: '01',
    tag: 'Digital Magazine',
    title: 'The Simpli Edit',
    desc: 'Your curated guide to affordable luxury, soft living, and intentional style. All 7 vols available.',
  },
  {
    href: '/styled',
    n: '02',
    tag: 'Fashion · Style',
    title: 'Simpli Styled',
    desc: 'Capsule wardrobes, outfit formulas, and get-the-look guides, curated the luxe-for-less way.',
  },
  {
    href: '/shift',
    n: '03',
    tag: 'Mindset · Intentional Living',
    title: 'Soft Life Shift',
    desc: 'Weekly intentional living moments. Gentle frameworks, journaling prompts, and Notes to Self.',
  },
  {
    href: '/lessons',
    n: '04',
    tag: 'Teaching · Wisdom',
    title: 'Luxe Life Lessons',
    desc: 'The philosophies behind the soft life. On confidence, growth, rest, and the art of becoming.',
  },
  {
    href: '/sip',
    n: '05',
    tag: 'Mocktails · Rituals',
    title: 'The Simpli Sip',
    desc: 'Elevated mocktail recipes with flavor profiles, how-to steps, and vibe notes. Ritual in a glass.',
  },
  {
    href: '/premium',
    n: '06',
    tag: 'Personal Styling',
    title: 'Styling Services',
    desc: 'Your personal style brief, capsule boards, and curated shopping collection, built around your life.',
  },
];

export default async function HomePage() {
  const featured = await getFeaturedCollections();

  return (
    <>
      <div className="hero">
        <div className="hi">
          <div className="hey an d1">Simpli Luxe</div>
          <div className="hsl an d1">SL</div>
          <div className="hbr an d1">Simpli Luxe</div>
          <div className="hln an d2" />
          <h1 className="htitle an d2">
            A life that feels as <em>good</em> as it looks.
          </h1>
          <p className="hsub an d2">Affordable luxury · Intentional living · The soft life</p>
          <HeroQuotes />
          <div className="era-b an d3">
            <div className="era-dot" />
            <div className="era-txt">Now in The Expansion Era · Q3 2026</div>
          </div>
          <div className="hpills an d3">
            <Link href="/edit" className="hpill">
              The Simpli Edit
            </Link>
            <Link href="/shift" className="hpill">
              Soft Life Shift
            </Link>
            <Link href="/sip" className="hpill">
              The Simpli Sip
            </Link>
            <Link href="/premium" className="hpill">
              Styling Services
            </Link>
          </div>
          <Link href="/edit" className="hcta an d4">
            Read the Latest Issue
          </Link>
        </div>
      </div>

      <div className="lll">
        <div className="li">
          <div className="sey">Simpli Luxe&apos;s Biggest Series</div>
          <h2 className="stitle">
            Life&apos;s Little <em>Luxuries</em>
          </h2>
          <div className="sscript">with Staci</div>
          <p className="sbody">
            The small moments that make life feel elevated. A perfectly made coffee, morning light
            through clean windows, the joy of a fresh candle. Life&apos;s Little Luxuries captures the
            beauty of choosing presence over perfection, every single day.
          </p>
          <div className="lcats">
            <div className="lcat">
              <div className="lcat-i">💕</div>
              <div className="lcat-n">Love &amp; Relationships</div>
            </div>
            <div className="lcat">
              <div className="lcat-i">🌙</div>
              <div className="lcat-n">Soft Evenings</div>
            </div>
            <div className="lcat">
              <div className="lcat-i">✨</div>
              <div className="lcat-n">Everyday Indulgence</div>
            </div>
            <div className="lcat">
              <div className="lcat-i">🌿</div>
              <div className="lcat-n">Out &amp; About</div>
            </div>
            <div className="lcat">
              <div className="lcat-i">🌸</div>
              <div className="lcat-n">Personal Joy</div>
            </div>
          </div>
          <Link href="/luxuries" className="hcta" style={{ marginTop: 24, display: 'inline-block' }}>
            Explore Life&apos;s Little Luxuries →
          </Link>
        </div>
      </div>

      <div className="ser-sec">
        <div className="sey" style={{ marginBottom: 5 }}>
          The Simpli Luxe Network
        </div>
        <h2 className="stitle" style={{ marginBottom: 22 }}>
          Explore the <em>Series</em>
        </h2>
      </div>
      <div className="sgrid">
        {SERIES.map((s) => (
          <Link key={s.href} href={s.href} className="sc">
            <div className="scn">{s.n}</div>
            <div className="sct">{s.tag}</div>
            <div className="sctitle">{s.title}</div>
            <div className="scdesc">{s.desc}</div>
            <span className="scarr">→</span>
          </Link>
        ))}
      </div>

      <div style={{ height: 40 }} />

      <div className="lll" style={{ padding: '44px 24px' }}>
        <div className="li">
          <div className="sey">Curated by Staci · ShopMy</div>
          <h2 className="stitle">
            Shop the <em>Collections</em>
          </h2>
          <div className="sscript">luxe for less · intentional finds</div>
          <p className="sbody">
            Every collection is built with one intention. Pieces that look expensive, feel
            effortless, and support the life you&apos;re already building. No impulse. All intention.
          </p>
        </div>
      </div>
      <div className="coll-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
        {featured.map((c) => (
          <CollectionCard
            key={c.id}
            collection={{
              ...c,
              tag: c.featuredTag || c.tag,
              name: c.featuredName || c.name,
              description: c.featuredDescription || c.description,
            }}
            cta="Shop Collection →"
            ctaHref="/shop"
          />
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Link
          href="/shop"
          className="hcta"
          style={{
            background: 'transparent',
            color: 'var(--gold)',
            border: '1px solid rgba(201,169,110,0.28)',
          }}
        >
          View All Collections →
        </Link>
      </div>

      <QuoteBand
        quote="Expansion is not something you chase. It is something you grow into, slowly, intentionally, on your own terms."
        cite="The Simpli Edit, Vol 07 · The In Full Sun Edit"
      />
      <Footer links={['Instagram', 'TikTok', 'Pinterest', 'LTK', 'YouTube']} />
    </>
  );
}
