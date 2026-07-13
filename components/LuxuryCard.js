'use client';

import { useRef, useState } from 'react';

// One moment in Life's Little Luxuries. The cover is always the first
// attachment (photo or video); if there is more than one, a stacked
// indicator opens a swipeable carousel on tap.
export default function LuxuryCard({ item }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const media = item.media || [];
  const cover = media[0];
  const hasMore = media.length > 1;
  const touchX = useRef(null);

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
      <div className="lux-c">
        {cover ? (
          <div
            className="lux-cover"
            onClick={() => openAt(0)}
            style={{ cursor: media.length ? 'pointer' : 'default' }}
          >
            {cover.isVideo ? (
              <video className="lux-cover-media" src={cover.url} muted playsInline preload="metadata" />
            ) : (
              <img className="lux-cover-media" src={cover.url} alt={item.title} />
            )}
            {cover.isVideo && <div className="lux-play">▶</div>}
            {hasMore && (
              <div className="lux-stack" aria-label={`${media.length} photos`}>
                <span className="lux-stack-icon">⧉</span> {media.length}
              </div>
            )}
          </div>
        ) : null}
        <div className="lux-body">
          {item.isNew && <div className="lux-new">✦ New</div>}
          {item.category && <div className="lux-cat">{item.category}</div>}
          <h3 className="lux-title">{item.title}</h3>
          {item.body && <p className="lux-text">{item.body}</p>}
        </div>
      </div>

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
            {media[index].isVideo ? (
              <video
                className="lux-carousel-media"
                src={media[index].url}
                controls
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img className="lux-carousel-media" src={media[index].url} alt={item.title} />
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
