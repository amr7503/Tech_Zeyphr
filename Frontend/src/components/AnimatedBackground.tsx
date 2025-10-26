import React from 'react';

const Blob: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={`gradient-blob ${className || ''}`} style={style} />
);

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-bg pointer-events-none" aria-hidden>
      <div className="animated-gradient" />

      {/* Floating blobs */}
      <Blob className="blob-1" style={{ animationDelay: '0s' }} />
      <Blob className="blob-2" style={{ animationDelay: '1.5s' }} />
      <Blob className="blob-3" style={{ animationDelay: '3s' }} />
      <Blob className="blob-4" style={{ animationDelay: '0.7s' }} />

      {/* Subtle moving particles (decorative) */}
      <div className="particles">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s`, width: `${4 + Math.random() * 10}px`, height: `${4 + Math.random() * 10}px` }} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
