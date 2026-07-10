// Dark page banner used at the top of every series page.
// `title` renders before the italic gold `emphasis` word.
export default function PageHeader({ eyebrow, title, emphasis, sub }) {
  return (
    <div className="ph">
      <div className="ph-ey">{eyebrow}</div>
      <h1 className="ph-t">
        {title} <em>{emphasis}</em>
      </h1>
      <p className="ph-s">{sub}</p>
    </div>
  );
}
