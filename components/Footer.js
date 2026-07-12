import { SOCIAL_LINKS } from '@/lib/social';

const DEFAULT_LINKS = ['Instagram', 'TikTok', 'Pinterest'];

export default function Footer({ links = DEFAULT_LINKS, series = '' }) {
  return (
    <footer>
      <img src="/logo.png" alt="Simpli Luxe" className="fsl-logo" />
      <div className="fbr">Simpli Luxe</div>
      <div className="flinks">
        {links.map((l) => {
          const href = SOCIAL_LINKS[l] || '#';
          const external = href.startsWith('http');
          return (
            <a
              key={l}
              href={href}
              className="flnk"
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
            >
              {l}
            </a>
          );
        })}
      </div>
      <div className="fcp">
        © 2026 Simpli Luxe{series ? ` · ${series}` : ' · For the woman curating a life that feels as good as it looks.'}
      </div>
    </footer>
  );
}
