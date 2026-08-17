// Simplified circular badge approximating the Beyond The Cardboard logo.
// Used at small sizes (38–48px) in the app header.
export default function BtcLogo({ size = 38, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Dark outer ring */}
      <circle cx="50" cy="50" r="50" fill="#1a0800" />
      {/* Thin red accent ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#d41500" strokeWidth="2" />
      {/* Red inner field */}
      <circle cx="50" cy="50" r="37" fill="#d41500" />

      {/* Stacked card icon — three dark cards offset top-left to bottom-right */}
      <rect x="18" y="22" width="30" height="40" rx="4" fill="#1a0800" />
      <rect x="27" y="30" width="30" height="40" rx="4" fill="#1a0800" />
      <rect x="37" y="38" width="30" height="40" rx="4" fill="#1a0800" />

      {/* Hexagon outline on the front card (red shows through) */}
      <polygon
        points="52,51 59,55 59,65 52,69 45,65 45,55"
        fill="none"
        stroke="#d41500"
        strokeWidth="3"
      />
    </svg>
  )
}
