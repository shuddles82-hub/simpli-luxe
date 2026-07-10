'use client';

// Horizontal chip row. Chips come from the actual content on the page
// (eras, seasons, categories), so filters never go stale.
export default function FilterBar({ allLabel = 'All', chips, active, onChange }) {
  return (
    <div className="fb">
      <div className={`fc${active === null ? ' on' : ''}`} onClick={() => onChange(null)}>
        {allLabel}
      </div>
      {chips.map((chip) => (
        <div
          key={chip}
          className={`fc${active === chip ? ' on' : ''}`}
          onClick={() => onChange(active === chip ? null : chip)}
        >
          {chip}
        </div>
      ))}
    </div>
  );
}
