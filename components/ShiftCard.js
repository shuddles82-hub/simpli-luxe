import Link from 'next/link';
import SaveButton from './SaveButton';
import ShareRow from './ShareRow';
import { linkify } from './RichText';

function BodyParagraphs({ text }) {
  const paras = String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p, i) => <p key={i}>{linkify(p)}</p>);
}

export default function ShiftCard({ item }) {
  const hasColumns = item.letGoOf?.length > 0 || item.inviteIn?.length > 0;
  return (
    <article className="shc">
      {item.image && <img className="card-hero" src={item.image} alt={item.title} />}
      <div className="shh">
        <div className="shmeta">
          {item.era && <span className="sh-era">{item.era}</span>}
          {item.season && <span className="sh-sea">{item.season}</span>}
          {item.isNew && <span className="sh-new">✦ New This Week</span>}
        </div>
        <h2 className="sh-title">
          <Link href={`/shift/${item.id}`}>{item.title}</Link>
        </h2>
        {item.subtitle && <div className="sh-script">{item.subtitle}</div>}
        <div className="sh-body">
          <BodyParagraphs text={item.body} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <SaveButton
            contentKey={item.id}
            series="Soft Life Shift"
            title={item.title}
            href={`/shift/${item.id}`}
          />
          <ShareRow path={`/shift/${item.id}`} title={item.title} text={item.quote} image={item.image} />
        </div>
      </div>
      {item.quote && (
        <div className="sh-q">
          <p>&ldquo;{item.quote}&rdquo;</p>
        </div>
      )}
      {(hasColumns || item.journalingPrompt) && (
        <div className="sh2">
          {item.journalingPrompt && (
            <div>
              <div className="shch">Journaling Prompt</div>
              <div className="sh-prompt">{item.journalingPrompt}</div>
            </div>
          )}
          {item.letGoOf?.length > 0 && (
            <div>
              <div className="shch">Let Go Of</div>
              <ul className="shl">
                {item.letGoOf.map((x, i) => (
                  <li key={i}>{linkify(x)}</li>
                ))}
              </ul>
            </div>
          )}
          {item.inviteIn?.length > 0 && (
            <div>
              <div className="shch">{item.inviteHeading || 'Invite In'}</div>
              <ul className="shl">
                {item.inviteIn.map((x, i) => (
                  <li key={i}>{linkify(x)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {item.tip && <div className="sh-tip">&ldquo;{item.tip}&rdquo;</div>}
    </article>
  );
}
