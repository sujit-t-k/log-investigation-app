import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        border: '1px solid var(--status-error-border)',
        backgroundColor: 'var(--status-error-bg)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-error)',
        }}
      >
        <AlertCircle size={26} />
      </div>

      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#991B1B', marginBottom: '0.35rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#B91C1C', maxWidth: '480px', margin: '0 auto' }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline"
          style={{
            borderColor: '#FCA5A5',
            backgroundColor: '#FFFFFF',
            color: '#B91C1C',
            marginTop: '0.5rem',
          }}
        >
          <RefreshCw size={15} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;

