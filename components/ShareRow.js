'use client';

import { useEffect, useState } from 'react';

// A small share row for content detail pages: a native Share button
// (Messages, Mail, WhatsApp, Instagram, Facebook, etc., whatever the
// device offers) where supported, a dedicated Pinterest pin (so the
// pinned image/description stay controlled rather than whatever the
// OS share sheet does with a link), and Copy Link everywhere.
//
// `premium` marks this post as Insider-gated. When true, `text` must
// only ever be the free-preview portion (a quote, subtitle, excerpt)
// never the full gated body, and the shared message always adds a
// "Read the rest with Luxe Insider" line so nobody can share their way
// around the paywall.
export default function ShareRow({ path, title, text, image, premium }) {
  const [origin, setOrigin] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator !== 'undefined' && Boolean(navigator.share));
  }, []);

  const url = `${origin}${path}`;
  const shareText = premium
    ? [text, 'Read the rest with Luxe Insider.'].filter(Boolean).join('\n\n')
    : text || title || '';

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      // user canceled the native share sheet; nothing to do
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; the link is still visible in the address bar
    }
  }

  const pinHref = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}${
    image ? `&media=${encodeURIComponent(image)}` : ''
  }&description=${encodeURIComponent(shareText || title || '')}`;

  return (
    <div className="share-row">
      {canNativeShare && (
        <button className="savebtn" onClick={nativeShare}>
          ↗ Share
        </button>
      )}
      <a className="savebtn" href={pinHref} target="_blank" rel="noreferrer">
        Pinterest
      </a>
      <button className="savebtn" onClick={copyLink}>
        {copied ? '✦ Copied' : 'Copy Link'}
      </button>
    </div>
  );
}
