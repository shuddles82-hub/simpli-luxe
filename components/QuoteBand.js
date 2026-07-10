export default function QuoteBand({ quote, cite, style }) {
  return (
    <div className="qs" style={style}>
      <p>&ldquo;{quote}&rdquo;</p>
      <cite>{cite}</cite>
    </div>
  );
}
