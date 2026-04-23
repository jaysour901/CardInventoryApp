export default function TradingCardIcon({ size = 40, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.375)}
      viewBox="0 0 32 44"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Card outline */}
      <rect x="1.5" y="1.5" width="29" height="41" rx="3" fill="white" stroke="currentColor" strokeWidth="2"/>
      {/* Header color band */}
      <path d="M1.5 4.5 Q1.5 1.5 4.5 1.5 H27.5 Q30.5 1.5 30.5 4.5 V12 H1.5 Z" fill="currentColor"/>
      {/* Photo area */}
      <rect x="5" y="15" width="22" height="17" rx="1.5" fill="currentColor" opacity="0.18"/>
      {/* Player head */}
      <circle cx="16" cy="20" r="4" fill="currentColor" opacity="0.5"/>
      {/* Player shoulders */}
      <path d="M10 32 Q10 26 16 26 Q22 26 22 32" fill="currentColor" opacity="0.5"/>
      {/* Name line */}
      <rect x="5" y="35" width="22" height="2.5" rx="1.25" fill="currentColor" opacity="0.4"/>
      {/* Sub line */}
      <rect x="8" y="39" width="16" height="2" rx="1" fill="currentColor" opacity="0.25"/>
    </svg>
  )
}
