import './globals.css';
import Nav from '@/components/Nav';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata = {
  title: 'Simpli Luxe',
  description:
    'A life that feels as good as it looks. Affordable luxury, intentional living, the soft life.',
  openGraph: {
    siteName: 'Simpli Luxe',
    type: 'website',
    title: 'Simpli Luxe',
    description:
      'A life that feels as good as it looks. Affordable luxury, intentional living, the soft life.',
  },
  twitter: {
    card: 'summary',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Simpli Luxe',
  },
};

export const viewport = {
  themeColor: '#0D0D0D',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500;600&family=Dancing+Script:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
