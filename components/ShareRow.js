'use client';

import { useEffect, useState } from 'react';

// A small share row for content detail pages: Facebook, Pinterest,
// text message, and copy-link always available, plus a native "Share"
// button (Messages, WhatsApp, Mail, Instagram, etc.) on devices that
// support it.
export default function ShareRow({ path, title, text, image }) {
  const [origin, setOrigin] = useState('');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator !== 'undefined' && Boolean(navigator.share));
  }, []);

  const url = `${origin}${path}`;
  const shareText = text || title || '';

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

  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const pinHref = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}${
    image ? `&media=${encodeURIComponent(image)}` : ''
  }&description=${encodeURIComponent(title || '')}`;
  const smsHref = `sms:?&body=${encodeURIComponent(`${title ? `${title} ` : ''}${url}`)}`;

  return (
    <div className="share-row">
      {canNativeShare && (
        <button className="savebtn" onClick={nativeShare}>
          ↗ Share
        </button>
      )}
      <a className="savebtn" href={fbHref} target="_blank" rel="noreferrer">
        Facebook
      </a>
      <a className="savebtn" href={pinHref} target="_blank" rel="noreferrer">
        Pinterest
      </a>
      <a className="savebtn" href={smsHref}>
        Text
      </a>
      <button className="savebtn" onClick={copyLink}>
        {copied ? '✦ Copied' : 'Copy Link'}
      </button>
    </div>
  );
}
