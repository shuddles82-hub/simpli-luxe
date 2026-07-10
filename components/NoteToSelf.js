import SaveButton from './SaveButton';

// Dark quote card shown inline in the Soft Life Shift feed.
// The note text lives in `body` (or `quote` for promoted records).
// An optional `highlight` phrase renders in gold, matching the
// reference treatment.
export default function NoteToSelf({ item }) {
  const text = item.body || item.quote || item.title || '';
  let content = text;
  if (item.highlight && text.includes(item.highlight)) {
    const [before, after] = text.split(item.highlight);
    content = (
      <>
        {before}
        <span>{item.highlight}</span>
        {after}
      </>
    );
  }
  const shortTitle = text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
  return (
    <div className="nts">
      <div className="nts-ey">Note to Self{item.isNew ? ' · New' : ''}</div>
      <div className="nts-t">&ldquo;{content}&rdquo;</div>
      <div style={{ marginTop: 12 }}>
        <SaveButton
          contentKey={item.id}
          series="Note to Self"
          title={shortTitle}
          href={`/shift/${item.id}`}
        />
      </div>
    </div>
  );
}
