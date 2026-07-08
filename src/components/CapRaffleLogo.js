'use client';

export default function CapRaffleLogo({ className = '', size = 'md' }) {
  const scale = size === 'sm' ? 0.84 : size === 'lg' ? 1.14 : 1;
  const width = 210 * scale;
  const height = 60 * scale;

  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${className}`}
      style={{ width, height }}
      aria-label="CapRaffle"
    >
      <svg viewBox="0 0 210 70" width="100%" height="100%" role="img" aria-hidden="true" className="block">
        <g fill="#f5a623" stroke="#f5a623" strokeWidth="1" strokeLinejoin="round">
          <path d="M108 4 L112 14 L120 6 L118 20 L127 20 L129 30 L91 30 L93 20 L102 20 L100 6 L108 14 Z" />
        </g>
        <circle cx="108" cy="3" r="3.2" fill="#f5a623" />
        <circle cx="129" cy="19" r="3" fill="#f5a623" />
        <circle cx="91" cy="19" r="3" fill="#f5a623" />

        <text
          x="6"
          y="58"
          fill="#ffffff"
          fontFamily="Arial Black, Arial, Helvetica, sans-serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="-1"
        >
          CAP
        </text>
<text
          x="78"
          y="58"
          fill="#f5a623"
          fontFamily="Arial Black, Arial, Helvetica, sans-serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="-1"
        >
          RAFFLE
        </text>
      </svg>
    </span>
  );
}