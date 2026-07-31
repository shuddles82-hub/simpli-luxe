import LuxeCodeCard from './LuxeCodeCard';

// Plain grid, no filter chips — episodes are just chronological, and
// this already scales gracefully well past a season's 24+ episodes
// (same responsive auto-fit grid used across the site).
export default function LuxeCodeExplorer({ items }) {
  return (
    <>
      <div className="lux-grid">
        {items.map((item) => (
          <LuxeCodeCard key={item.id} item={item} />
        ))}
      </div>
      {items.length === 0 && (
        <div className="empty">Nothing here yet. Something lovely is on the way.</div>
      )}
    </>
  );
}
