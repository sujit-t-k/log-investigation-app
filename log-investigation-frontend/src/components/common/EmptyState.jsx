import React from 'react';
import { SearchX, Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  message = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        borderStyle: 'dashed',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Icon size={28} />
      </div>

      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
          {message}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '0.5rem' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

