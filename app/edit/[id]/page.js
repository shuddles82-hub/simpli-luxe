import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import QuoteBand from '@/components/QuoteBand';
import SaveButton from '@/components/SaveButton';
import { getEditIssueById } from '@/lib/content';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const issue = await getEditIssueById(id);
  if (!issue) return { title: 'The Simpli Edit · Simpli Luxe' };
  const title = `${issue.title} · The Simpli Edit`;
  const description = String(issue.tagline || issue.pullQuote || '').slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(issue.cover ? { images: [issue.cover] } : {}),
    },
  };
}

function Paragraphs({ text }) {
  const paras = String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p, i) => <p key={i}>{p}</p>);
}

export default async function EditIssueDetailPage({ params }) {
  const { id } = await params;
  const issue = await getEditIssueById(id);
  if (!issue) notFound();

  const tagLine = [
    issue.volume ? `Vol ${String(issue.volume).padStart(2, '0')}` : null,
    issue.era,
    issue.season,
  ]
    .filter(Boolean)
    .join(' · ');

  const hasCapsule = issue.capsuleStaples?.length > 0 || issue.capsuleFormulas?.length > 0;
  const hasShopTiers =
    issue.shopUnder30?.length > 0 || issue.shopUnder75?.length > 0 || issue.shopSplurges?.length > 0;

  return (
    <>
      <div className="rmh" style={{ position: 'static' }}>
        <div>
          <div className="rm-tag">{tagLine || 'The Simpli Edit'}</div>
          <div className="rm-title">{issue.title}</div>
          {issue.subtitle && (
            <div
              style={{
                fontFamily: "'Dancing Script',cursive",
                fontSize: 15,
                color: 'rgba(201,169,110,0.7)',
                marginTop: 5,
              }}
            >
              {issue.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SaveButton
            contentKey={issue.id}
            series="The Simpli Edit"
            title={issue.title}
            href={`/edit/${issue.id}`}
          />
          <Link className="rm-close" href="/edit">
            ← All Issues
          </Link>
        </div>
      </div>

      {issue.pullQuote && <QuoteBand quote={issue.pullQuote} cite={issue.title} />}

      {issue.lessonBody && (
        <div className="lll">
          <div className="li">
            <div className="sey">Luxe Life Lesson</div>
            <h2 className="stitle">{issue.lessonTitle || 'This Issue’s Lesson'}</h2>
            <div className="sbody">
              <Paragraphs text={issue.lessonBody} />
            </div>
          </div>
        </div>
      )}

      {(issue.shiftBody || issue.letGoOf?.length > 0 || issue.inviteIn?.length > 0) && (
        <div className="sfd" style={{ paddingTop: 0 }}>
          <article className="shc">
            <div className="shh">
              <div className="sh-title">Soft Life Shift</div>
              {issue.shiftBody && (
                <div className="sh-body">
                  <Paragraphs text={issue.shiftBody} />
                </div>
              )}
            </div>
            {(issue.letGoOf?.length > 0 || issue.inviteIn?.length > 0) && (
              <div className="sh2">
                {issue.letGoOf?.length > 0 && (
                  <div>
                    <div className="shch">Let Go Of</div>
                    <ul className="shl">
                      {issue.letGoOf.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {issue.inviteIn?.length > 0 && (
                  <div>
                    <div className="shch">Invite In</div>
                    <ul className="shl">
                      {issue.inviteIn.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      )}

      {(issue.styledTitle || hasCapsule) && (
        <div className="lll">
          <div className="li">
            <div className="sey">Simpli Styled</div>
            {issue.styledTitle && <h2 className="stitle">{issue.styledTitle}</h2>}
            {hasCapsule && (
              <div className="r2c" style={{ marginTop: 18 }}>
                {issue.capsuleStaples?.length > 0 && (
                  <div>
                    <div className="rch">Capsule Staples</div>
                    <ul className="rl">
                      {issue.capsuleStaples.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {issue.capsuleFormulas?.length > 0 && (
                  <div>
                    <div className="rch">Outfit Formulas</div>
                    <ul className="rl">
                      {issue.capsuleFormulas.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {(issue.lifestyleBody || issue.sipName) && (
        <div className="sfd" style={{ paddingTop: issue.styledTitle || hasCapsule ? 0 : 40 }}>
          <article className="shc">
            <div className="shh">
              <div className="sh-title">Lifestyle &amp; Home</div>
              {issue.lifestyleBody && (
                <div className="sh-body">
                  <Paragraphs text={issue.lifestyleBody} />
                </div>
              )}
            </div>
            {issue.sipName && (
              <div className="vbar">
                This week&apos;s Simpli Sip: {issue.sipName}
              </div>
            )}
          </article>
        </div>
      )}

      {hasShopTiers && (
        <div className="lll">
          <div className="li">
            <div className="sey">Shop the Edit</div>
            <h2 className="stitle" style={{ marginBottom: 18 }}>
              Curated <em>Picks</em>
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 22,
              }}
            >
              {issue.shopUnder30?.length > 0 && (
                <div>
                  <div className="rch">Under $30</div>
                  <ul className="rl">
                    {issue.shopUnder30.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {issue.shopUnder75?.length > 0 && (
                <div>
                  <div className="rch">Under $75</div>
                  <ul className="rl">
                    {issue.shopUnder75.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              {issue.shopSplurges?.length > 0 && (
                <div>
                  <div className="rch">Splurges</div>
                  <ul className="rl">
                    {issue.shopSplurges.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {issue.editorsNote && (
        <div className="nts" style={{ margin: '3px 0 0' }}>
          <div className="nts-ey">Editor&apos;s Note</div>
          <div className="nts-t">{issue.editorsNote}</div>
        </div>
      )}

      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Link className="fc" href="/edit" style={{ display: 'inline-block' }}>
          ← All Issues
        </Link>
      </div>

      <Footer series="The Simpli Edit" links={['Instagram', 'TikTok', 'LTK']} />
    </>
  );
}
