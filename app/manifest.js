// Next.js app/manifest.js convention: auto-served at /manifest.webmanifest
// with the <link rel="manifest"> tag injected automatically.
export default function manifest() {
  return {
    name: 'Simpli Luxe',
    short_name: 'Simpli Luxe',
    description:
      'A life that feels as good as it looks. Affordable luxury, intentional living, the soft life.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0D0D',
    theme_color: '#0D0D0D',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
