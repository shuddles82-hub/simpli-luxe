import Link from 'next/link';
import SaveButton from './SaveButton';
import ShareRow from './ShareRow';

// A Simpli Edit issue's full HTML magazine, shown inside the app under
// the site nav with a way back to the other issues. The magazine files
// have no app navigation of their own, and the installed app has no
// browser back button, so they're framed here rather than linked to.
export default function EditMagazine({ issue }) {
  const path = `/edit/${issue.slug}`;
  const label = `Vol ${String(issue.volume).padStart(2, '0')} · ${issue.title}`;

  return (
    <div className="emv">
      <div className="emv-bar">
        <Link className="rm-close" href="/edit">
          ← All Issues
        </Link>
        <div className="emv-title">{label}</div>
        <div className="emv-actions">
          <SaveButton
            contentKey={issue.id}
            series="The Simpli Edit"
            title={issue.title}
            href={path}
          />
          <ShareRow
            path={path}
            title={issue.title}
            text={issue.pullQuote || issue.tagline}
            image={issue.cover}
          />
        </div>
      </div>
      <iframe className="emv-frame" src={issue.htmlUrl} title={label} />
    </div>
  );
}
