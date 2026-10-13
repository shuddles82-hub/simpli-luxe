'use client';

import { useEffect, useRef } from 'react';

// The magazines are laid out 1000px wide and scaled down to fit the
// screen, so iOS Safari's text autosizing decides some paragraphs are
// too small and enlarges them until lines overlap. Turning it off inside
// the frame keeps the type at its designed size without editing the
// magazine files themselves.
const NO_AUTOSIZE = 'html{-webkit-text-size-adjust:100%;text-size-adjust:100%;}';

function disableTextAutosizing(frame) {
  try {
    const doc = frame && frame.contentDocument;
    if (!doc || !doc.head || doc.getElementById('sl-no-autosize')) return;
    const style = doc.createElement('style');
    style.id = 'sl-no-autosize';
    style.textContent = NO_AUTOSIZE;
    doc.head.appendChild(style);
  } catch {
    // Not same-origin or not loaded yet; nothing to adjust.
  }
}

export default function EditMagazineFrame({ src, title }) {
  const ref = useRef(null);

  // The frame can finish loading before hydration attaches onLoad.
  useEffect(() => {
    const frame = ref.current;
    if (frame?.contentDocument?.readyState === 'complete') disableTextAutosizing(frame);
  }, []);

  return (
    <iframe
      ref={ref}
      className="emv-frame"
      src={src}
      title={title}
      onLoad={(e) => disableTextAutosizing(e.currentTarget)}
    />
  );
}
