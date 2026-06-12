// Friendly inline cartoon for the onboarding screen — a waving character
// surrounded by floating tech sparkles. Pure SVG, no external assets.
export default function OnboardingHero({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} role="img" aria-label="Friendly robot welcoming you">
      <defs>
        <linearGradient id="ob-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#f5f3ff" />
        </linearGradient>
        <linearGradient id="ob-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="150" rx="84" ry="14" fill="#ede9fe" />

      {/* floating sparkles */}
      <g className="animate-float" style={{ animationDelay: "0.2s" }}>
        <circle cx="40" cy="42" r="6" fill="#c4b5fd" />
        <path d="M196 36l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#a78bfa" />
      </g>
      <g className="animate-float" style={{ animationDelay: "0.9s" }}>
        <rect x="188" y="92" width="11" height="11" rx="3" fill="#c4b5fd" />
        <circle cx="48" cy="104" r="5" fill="#a78bfa" />
      </g>

      {/* robot */}
      <g className="animate-float">
        <rect x="86" y="58" width="68" height="58" rx="16" fill="url(#ob-body)" />
        <rect x="98" y="72" width="44" height="26" rx="9" fill="#1f2937" />
        <circle cx="113" cy="85" r="5" fill="#a7f3d0" />
        <circle cx="129" cy="85" r="5" fill="#a7f3d0" />
        <rect x="110" y="44" width="20" height="14" rx="6" fill="#7c3aed" />
        <circle cx="120" cy="40" r="6" fill="#facc15" />
        {/* waving arm */}
        <rect x="150" y="70" width="26" height="9" rx="4.5" fill="#7c3aed" transform="rotate(-28 150 74)" />
        <rect x="64" y="80" width="26" height="9" rx="4.5" fill="#7c3aed" />
        <rect x="96" y="116" width="14" height="16" rx="5" fill="#5b21b6" />
        <rect x="130" y="116" width="14" height="16" rx="5" fill="#5b21b6" />
      </g>
    </svg>
  );
}
