'use client';

export default function BrandLogo({ locale = 'fr', className = '', size = 'md' }) {
  const isFr = locale === 'fr';
  const mark = isFr ? 'R' : 'L';
  const word = isFr ? 'REGAR' : 'LOOK';
  const width = isFr ? 116 : 92;
  const scale = size === 'sm' ? 0.86 : size === 'lg' ? 1.16 : 1;

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
        <text
          x="0"
          y="17"
          fill="currentColor"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="900"
          letterSpacing="-0.8"
        >
          {mark}
        </text>
        <text
          x="30"
          y="16"
          fill="currentColor"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="14"
          fontWeight="800"
          letterSpacing="5"
        >
          {word}
        </text>
      </svg>
    </span>
  );
}
