'use client';

export default function BrandLogo({ locale = 'fr', className = '', size = 'md' }) {
  const isFr = locale === 'fr';
  const word = isFr ? 'REGAR' : 'LOOK';
  const width = isFr ? 116 : 91;
  const scale = size === 'sm' ? 0.86 : size === 'lg' ? 1.16 : 1;
  const wordX = 34;

  return (
    <span
      className={`inline-flex items-center leading-none ${className}`}
      style={{ width: `${width * scale}px`, height: `${24 * scale}px` }}
      aria-label={isFr ? 'Regar' : 'Look'}
    >
      <svg
        viewBox={`0 0 ${width} 24`}
        width="100%"
        height="100%"
        role="img"
        aria-hidden="true"
        className="block"
      >
        {isFr ? (
          <g fill="currentColor">
            <path d="M2.2 5.1h16.2c4 0 6.3 2 6.3 5.1 0 2.7-1.8 4.5-4.8 5l5.2 3.8h-7.7l-8.1-6.1h8.1c2 0 3.1-.8 3.1-2.3 0-1.4-1.1-2.2-3.1-2.2H7.2l-5 3.6V5.1Z" />
            <path d="M2.2 15.8h5v3.2h-5v-3.2Z" />
          </g>
        ) : (
          <g fill="currentColor">
            <path d="M2.2 5.1h5.1v10.4h15.5V19H2.2V5.1Z" />
            <path d="M7.3 5.1h5.6l-5.6 4v-4Z" />
          </g>
        )}
        <text
          x={wordX}
          y="16.1"
          fill="currentColor"
          fontFamily="Montserrat, Avenir Next, Gotham, Arial, Helvetica, sans-serif"
          fontSize="13.8"
          fontWeight="750"
          letterSpacing="5.2"
        >
          {word}
        </text>
      </svg>
    </span>
  );
}
