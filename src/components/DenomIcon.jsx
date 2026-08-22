// Icon denom ne'ebe muda tuir jogu — koin gold ba "UC" (PUBG), permata ba "Diamond" (ML/FF),
// koin verde ba "Robux" (Roblox). Icon orisinal, la'os kópia husi logo ofisial jogu sira.

export default function DenomIcon({ game, size = 34 }) {
  if (game.currencyLabel === 'UC') {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="15" fill="url(#coinGrad)" stroke="#B8860B" strokeWidth="1.5" />
        <text x="17" y="22" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="13" fill="#7A5B00">UC</text>
        <defs>
          <linearGradient id="coinGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE38A" />
            <stop offset="1" stopColor="#F0B93E" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (game.currencyLabel === 'Robux') {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="15" fill="url(#robuxGrad)" stroke="#00753A" strokeWidth="1.5" />
        <text x="17" y="21.5" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="11.5" fill="#FFFFFF">R$</text>
        <defs>
          <linearGradient id="robuxGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2ECC71" />
            <stop offset="1" stopColor="#00A651" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // Diamond (Mobile Legends / Free Fire) — kor tuir accentColor jogu nian
  const c = game.accentColor
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 3 L28 12 L17 31 L6 12 Z" fill={c} opacity="0.92" />
      <path d="M6 12 L28 12 M11.5 12 L17 3 L22.5 12 M11.5 12 L17 31 M22.5 12 L17 31"
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}
