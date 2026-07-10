const DEFAULT_LINKS = ['Instagram', 'TikTok', 'Pinterest'];

export default function Footer({ links = DEFAULT_LINKS, series = '' }) {
  return (
    <footer>
      <div className="fsl">SL</div>
      <div className="fbr">Simpli Luxe</div>
      <div className="flinks">
        {links.map((l) => (
          <a key={l} href="#" className="flnk">
            {l}
          </a>
        ))}
      </div>
      <div className="fcp">
        © 2026 Simpli Luxe{series ? ` · ${series}` : ' · For the woman curating a life that feels as good as it looks.'}
      </div>
    </footer>
  );
}
