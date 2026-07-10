import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div className="sey">Simpli Luxe</div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 24,
          color: 'var(--obs)',
          maxWidth: 420,
          lineHeight: 1.4,
        }}
      >
        Nothing here yet. Something lovely is on the way.
      </div>
      <Link href="/" className="hcta">
        Back Home
      </Link>
    </div>
  );
}
