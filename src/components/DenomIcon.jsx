// Icon denom ne'ebe muda tuir jogu — koin gold ba "UC" (PUBG), permata ba "Diamond" (ML/FF),
// koin verde ba "Robux" (Roblox). Icon orisinal, la'os kópia husi logo ofisial jogu sira.

export default function DenomIcon({ game, size = 34 }) {
  if (game.currencyLabel === 'UC') {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coinGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF3C4" />
            <stop offset="0.55" stopColor="#FFDD7A" />
            <stop offset="1" stopColor="#E8A62E" />
          </linearGradient>
        </defs>
        <circle cx="17" cy="17" r="15" fill="url(#coinGrad)" stroke="#B8860B" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="11.5" fill="none" stroke="rgba(122,91,0,0.3)" strokeWidth="0.8" />
        <ellipse cx="12" cy="10.5" rx="5" ry="2.6" fill="#fff" opacity="0.45" />
        <text x="17" y="22" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="13" fill="#7A5B00">UC</text>
      </svg>
    )
  }

  if (game.currencyLabel === 'Robux') {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="robuxGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80" />
            <stop offset="0.55" stopColor="#22BB65" />
            <stop offset="1" stopColor="#00753A" />
          </linearGradient>
        </defs>
        <circle cx="17" cy="17" r="15" fill="url(#robuxGrad)" stroke="#00753A" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="11.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        <ellipse cx="12" cy="10.5" rx="5" ry="2.6" fill="#fff" opacity="0.3" />
        <text x="17" y="21.5" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="11.5" fill="#FFFFFF">R$</text>
      </svg>
    )
  }

  // Diamond (Mobile Legends / Free Fire) — kor tuir accentColor jogu nian
  const c = game.accentColor
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gemGrad-${c.replace('#', '')}`} x1="6" y1="3" x2="28" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor={c} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path d="M17 3 L28 12 L17 31 L6 12 Z" fill={`url(#gemGrad-${c.replace('#', '')})`} />
      <path d="M6 12 L28 12 M11.5 12 L17 3 L22.5 12 M11.5 12 L17 31 M22.5 12 L17 31 M8.5 12 L17 18 L25.5 12"
            stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M14 8 L17 5.5 L19.5 8 L17 11 Z" fill="#fff" opacity="0.85" />
    </svg>
  )
}
