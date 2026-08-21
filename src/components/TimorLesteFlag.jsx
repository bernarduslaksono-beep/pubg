export default function TimorLesteFlag({ width = 28, height = 14 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 150"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bandeira Timor-Leste"
      style={{ flexShrink: 0, borderRadius: 2 }}
    >
      <rect width="300" height="150" fill="#DC241F" />
      <polygon points="0,0 186,75 0,150" fill="#FFC726" />
      <polygon points="0,0 114,75 0,150" fill="#000000" />
      <path
        d="M54,61 L57.53,70.85 L67.31,70.67 L59.71,76.85 L62.23,86.33 L54,81 L45.77,86.33 L48.29,76.85 L40.69,70.67 L50.47,70.15 Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}
