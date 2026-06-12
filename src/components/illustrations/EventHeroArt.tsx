// Decorative cartoon for event hero banners: a little calendar with confetti.
// Sits in the corner of the gradient header; purely ornamental.
export default function EventHeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <g className="animate-float">
        <rect x="46" y="34" width="68" height="58" rx="10" fill="#ffffff" opacity="0.95" />
        <rect x="46" y="34" width="68" height="16" rx="10" fill="#facc15" />
        <rect x="58" y="28" width="6" height="14" rx="3" fill="#ffffff" />
        <rect x="96" y="28" width="6" height="14" rx="3" fill="#ffffff" />
        <rect x="56" y="58" width="14" height="12" rx="3" fill="#ede9fe" />
        <rect x="74" y="58" width="14" height="12" rx="3" fill="#c4b5fd" />
        <rect x="92" y="58" width="14" height="12" rx="3" fill="#ede9fe" />
        <rect x="56" y="74" width="14" height="12" rx="3" fill="#c4b5fd" />
        <rect x="74" y="74" width="14" height="12" rx="3" fill="#ede9fe" />
      </g>
      {/* confetti */}
      <g className="animate-float" style={{ animationDelay: "0.6s" }}>
        <circle cx="26" cy="30" r="4" fill="#fbcfe8" />
        <rect x="124" y="22" width="8" height="8" rx="2" fill="#a7f3d0" transform="rotate(20 128 26)" />
        <circle cx="132" cy="74" r="5" fill="#fde68a" />
        <path d="M22 78l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  );
}
