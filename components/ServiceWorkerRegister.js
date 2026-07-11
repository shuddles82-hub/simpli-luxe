'use client';

import { useEffect } from 'react';

// Registers the service worker once the page has finished loading, so
// it never competes with the initial render for bandwidth or CPU.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Installability is a nice-to-have; a failed registration
        // should never block the site itself.
      });
    };
    // The window may have already finished loading before this effect
    // runs (e.g. client-side navigation), in which case 'load' never
    // fires again.
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
