'use client';

export default function CapRaffleLogo({ className = '', size = 'md' }) {
  const scale = size === 'sm' ? 0.84 : size === 'lg' ? 1.14 : 1;
  const width = 185 * scale;
  const height = 56 * scale;

  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${className}`}
      style={{ width, height }}
      aria-label="CapRaffle"
    >
      <svg viewBox="0 0 185 56" width="100%" height="100%" role="img" aria-hidden="true" className="block">
        <g fill="#d99600">
          <path d="M82.8 1.8 90 9.7l6.9-9.7 7.6 9.6 7-7.1 2.7 22.7H80.4L82.8 1.8Z" />
          <circle cx="82.8" cy="2.2" r="2.2" />
          <circle cx="96.9" cy="2.2" r="2.2" />
          <circle cx="111.5" cy="2.8" r="2.2" />
          <path d="M82.7 28.3h29.2v4.1H82.7z" />
        </g>
        <text
          x="0"
          y="52"
          fill="#ffffff"
          fontFamily="Arial Black, Arial, Helvetica, sans-serif"
          fontSize="31"
          fontWeight="900"
          letterSpacing="-1.2"
        >
          CAP
        </text>
        <text
          x="69"
          y="52"
          fill="#d99600"
          fontFamily="Arial Black, Arial, Helvetica, sans-serif"
          fontSize="31"
          fontWeight="900"
          letterSpacing="-1.2"
        >
          RAFFLE
        </text>
      </svg>
    </span>
  );
}
