'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home' },
  { href: '/luxuries', label: "Life's Little Luxuries" },
  { href: '/edit', label: 'The Simpli Edit' },
  { href: '/styled', label: 'Simpli Styled' },
  { href: '/shift', label: 'Soft Life Shift' },
  { href: '/lessons', label: 'Luxe Life Lessons' },
  { href: '/sip', label: 'The Simpli Sip' },
  { href: '/premium', label: 'Styling Services' },
  { href: '/shop', label: 'Shop' },
  { href: '/planner', label: 'Planner' },
  { href: '/simplibot', label: 'SimpliBot' },
  { href: '/insider', label: '✦ Insider Hub' },
  { href: '/library', label: 'Library' },
  { href: '/account', label: '✦ Members' },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav>
      <Link href="/" className="nl">
        <img src="/logo.png" alt="Simpli Luxe" className="nl-logo" />
      </Link>
      <div className="nt">
        {TABS.map((tab, i) => (
          <span key={tab.href} style={{ display: 'contents' }}>
            <Link href={tab.href} className={`ntb${isActive(tab.href) ? ' on' : ''}`}>
              {tab.label}
            </Link>
            {i < TABS.length - 1 && <div className="nd" />}
          </span>
        ))}
      </div>
    </nav>
  );
}
