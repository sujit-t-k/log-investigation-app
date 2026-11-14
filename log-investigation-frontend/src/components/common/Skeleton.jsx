import React from 'react';

const Skeleton = ({ width, height, borderRadius, style = {}, className = '' }) => {
  return (
    <div
      className={`skeleton-item ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--radius-sm)',
        background: 'linear-gradient(90deg, #F1EEF6 25%, #E5DFEE 37%, #F1EEF6 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeletonPulse 1.4s ease infinite',
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="40%" height="1.1rem" />
      <Skeleton width="36px" height="36px" borderRadius="var(--radius-md)" />
    </div>
    <Skeleton width="60%" height="2rem" />
    <Skeleton width="80%" height="0.875rem" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', padding: '1rem' }}>
    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={`th-${i}`} width={`${100 / cols}%`} height="1.25rem" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={`tr-${r}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={`td-${r}-${c}`} width={`${100 / cols}%`} height="1rem" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;

