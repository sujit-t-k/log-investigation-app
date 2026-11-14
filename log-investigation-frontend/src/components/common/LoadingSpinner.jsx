import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 24, text = 'Loading...', fullPage = false, className = '' }) => {
  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          width: '100%',
          gap: '1rem',
          color: 'var(--primary-purple)',
        }}
        className={className}
      >
        <Loader2 size={size} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        {text && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{text}</span>}
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'inherit',
      }}
      className={className}
    >
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
      {text && <span>{text}</span>}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;

