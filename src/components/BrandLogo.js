'use client';

const LETTERS = {
  R: (
    <>
      <path d="M0 2.1h10.9c3.4 0 5.6 1.7 5.6 4.4 0 2.4-1.7 4-4.8 4.4l5.1 4.9h-5.6l-6.4-6.1h5.7c1.6 0 2.6-.7 2.6-1.9s-1-1.8-2.7-1.8H4.2L0 9.1V2.1Z" />
      <path d="M0 12.4h4.2v3.4H0v-3.4Z" />
    </>
  ),
  E: (
    <>
      <path d="M0 2.1h14.5v3.4H0V2.1Z" />
      <path d="M0 7.9h11.8v3.2H0V7.9Z" />
      <path d="M0 12.4h14.5v3.4H0v-3.4Z" />
    </>
  ),
  G: (
    <>
      <path d="M3.8 2.1h11.1v3.4H4.7c-1 0-1.4.5-1.4 1.4V11c0 1 .5 1.4 1.4 1.4h6.7V9.6h3.6v6.2H3.8C1.3 15.8 0 14.5 0 12V5.9c0-2.5 1.3-3.8 3.8-3.8Z" />
    </>
  ),
  A: (
    <>
      <path d="M6.2 2.1h4.1l6.2 13.7h-4.1l-1-2.4H5l-1 2.4H0L6.2 2.1Zm.1 8.2h3.9L8.3 5.7 6.3 10.3Z" />
    </>
  ),
  L: (
    <>
      <path d="M0 2.1h4.2v10.1h11.2v3.6H0V2.1Z" />
      <path d="M4.2 2.1h5.2L4.2 5.9V2.1Z" />
    </>
  ),
  O: (
    <>
      <path d="M4 2.1h8c2.7 0 4 1.3 4 4v5.7c0 2.7-1.3 4-4 4H4c-2.7 0-4-1.3-4-4V6.1c0-2.7 1.3-4 4-4Zm.8 3.5c-.9 0-1.4.5-1.4 1.4v3.9c0 1 .5 1.4 1.4 1.4h6.4c.9 0 1.4-.5 1.4-1.4V7c0-1-.5-1.4-1.4-1.4H4.8Z" />
    </>
  ),
  K: (
    <>
      <path d="M0 2.1h4.1v5.2h3l4.8-5.2h5L10.6 8.8l6.8 7h-5.3l-5-5.2h-3v5.2H0V2.1Z" />
    </>
  ),
};

function Wordmark({ word, x, y }) {
  let cursor = x;
  const letterGap = 6.4;
  const widths = { R: 16.8, E: 14.5, G: 15, A: 16.5, L: 15.4, O: 16, K: 17.4 };

  return (
    <g transform={`translate(${x} ${y})`} fill="currentColor">
      {word.split('').map((letter, index) => {
        const currentX = cursor - x;
        cursor += (widths[letter] || 15) + letterGap;
        return (
          <g key={`${letter}-${index}`} transform={`translate(${currentX} 0)`}>
            {LETTERS[letter]}
          </g>
        );
      })}
    </g>
  );
}

export default function BrandLogo({ locale = 'fr', className = '', size = 'md' }) {
  const word = 'REGAR';
  const width = 147;
  const scale = size === 'sm' ? 0.86 : size === 'lg' ? 1.16 : 1;

  return (
    <span
      className={`inline-flex items-center leading-none ${className}`}
      style={{ width: `${width * scale}px`, height: `${24 * scale}px` }}
      aria-label="Regar"
    >
      <svg
        viewBox={`0 0 ${width} 24`}
        width="100%"
        height="100%"
        role="img"
        aria-hidden="true"
        className="block"
      >
        <g fill="currentColor" transform="translate(0 3)">
          {LETTERS.R}
        </g>
        <Wordmark word={word} x={32} y={3} />
      </svg>
    </span>
  );
}
