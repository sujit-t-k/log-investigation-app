import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgLight,
  onClick,
  badge,
}) => {
  return (
    <div
      className="card stat-card"
      onClick={onClick}
      style={{
        padding: '1.35rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.1 }}>
            {value !== undefined && value !== null ? Number(value).toLocaleString() : '—'}
          </div>
        </div>

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: bgLight || 'var(--primary-light)',
            color: color || 'var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
        {badge && (
          <span
            className="badge"
            style={{
              backgroundColor: bgLight || 'var(--primary-light)',
              color: color || 'var(--primary-purple)',
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Subtle accent bar at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: color || 'var(--primary-purple)',
          opacity: 0.8,
        }}
      />
    </div>
  );
};

export default StatCard;

