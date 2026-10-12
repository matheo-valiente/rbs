import { useState } from 'react';

// <img> that falls back to a "[ PHOTO À VENIR ]" block while assets are missing.
export default function MediaImage({ src, alt, label = '[ PHOTO À VENIR ]', className }) {
  const [broken, setBroken] = useState(!src);
  if (broken) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--soft)',
          fontSize: 10,
          letterSpacing: '0.25em',
          opacity: 0.6
        }}
        role="img"
        aria-label={alt}
      >
        {label}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setBroken(true)} />;
}
