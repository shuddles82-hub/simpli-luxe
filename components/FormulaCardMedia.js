'use client';

import { useRef, useState } from 'react';

// The Formula Card Image field can hold several photos (or a short
// video). Shows the first as a full-width image with a stacked-photo
// badge when there's more than one, opening the same swipeable
// carousel used for Life's Little Luxuries.
export default function FormulaCardMedia({ media, title }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [videoError, setVideoError] = useState({});
  const touchX = useRef(null);

  if (!media || media.length === 0) return null;
  const cover = media[0];
  const hasMore = media.length > 1;

  function markVideoError(i) {
    setVideoError((prev) => ({ ...prev, [i]: true }));
  }

  function openAt(i) {
    setIndex(i);
    setOpen(true);
  }

  function next(e) {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % media.length);
  }
  function prev(e) {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + media.length) % media.length);
  }

  return (
    <>
      <figure style={{ marginTop: 24 }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => openAt(0)}
        >
          {cover.isVideo && videoError[0] ? (
            <div className="lux-cover-fallback" style={{ width: '100%', aspectRatio: '4/5' }}>
              🎬
            </div>
          ) : cover.isVideo ? (
            <video
              src={cover.url}
              muted
              playsInline
              preload="metadata"
              style={{ width: '100%', display: 'block' }}
              onError={() => markVideoError(0)}
            />
          ) : (
            <img src={cover.url} alt={`${title} formula card`} style={{ width: '100%', display: 'block' }} />
          )}
          {cover.isVideo && <div className="lux-play">▶</div>}
          {hasMore && (
            <div className="lux-stack" aria-label={`${media.length} photos`}>
              <span className="lux-stack-icon">⧉</span> {media.length}
            </div>
          )}
        </div>
        <figcaption
          style={{
            fontFamily: "'Jost',sans-serif",
            fontWeight: 400,
            fontSize: 8,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          The Formula
        </figcaption>
      </figure>

      {open && (
        <div className="bot-modal-ovl" onClick={() => setOpen(false)}>
          <div
            className="lux-carousel"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null || media.length < 2) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (dx > 40) prev();
              else if (dx < -40) next();
              touchX.current = null;
            }}
          >
            <button className="bot-modal-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
            {media[index].isVideo && videoError[index] ? (
              <div className="lux-video-fallback">
                <p>
                  This video format isn&apos;t supported on this device. You can still view it
                  directly.
                </p>
                <a href={media[index].url} target="_blank" rel="noreferrer" className="acc-btn ghost">
                  Open Video ↗
                </a>
              </div>
            ) : media[index].isVideo ? (
              <video
                key={media[index].url}
                className="lux-carousel-media"
                src={media[index].url}
                controls
                autoPlay
                muted
                loop
                playsInline
                onError={() => markVideoError(index)}
              />
            ) : (
              <img className="lux-carousel-media" src={media[index].url} alt={`${title} formula card`} />
            )}
            {media.length > 1 && (
              <>
                <button className="lux-nav lux-nav-prev" onClick={prev} aria-label="Previous">
                  ‹
                </button>
                <button className="lux-nav lux-nav-next" onClick={next} aria-label="Next">
                  ›
                </button>
                <div className="lux-dots">
                  {media.map((m, i) => (
                    <span
                      key={i}
                      className={`lux-dot${i === index ? ' on' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndex(i);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
