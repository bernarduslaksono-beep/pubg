export default function TrustBadges({ items }) {
  return (
    <div className="trust-badges">
      {items.map((text, i) => (
        <div className="trust-badge" key={i}>
          <span className="trust-check">✓</span>{text}
        </div>
      ))}
    </div>
  )
}
