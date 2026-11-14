import React from 'react';
import { getLogLevelMeta, getIncidentStatusMeta, getHttpStatusMeta } from '../../utils/formatters';

const StatusBadge = ({ type = 'logLevel', value, className = '', showDot = true }) => {
  let meta = { label: value || '—', color: 'inherit', bg: 'var(--bg-subtle)', border: 'var(--border-color)' };

  if (type === 'logLevel') {
    meta = getLogLevelMeta(value);
  } else if (type === 'incidentStatus') {
    meta = getIncidentStatusMeta(value);
  } else if (type === 'httpStatus') {
    meta = getHttpStatusMeta(value);
  }

  return (
    <span
      className={`badge ${className}`}
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        borderColor: meta.border || 'transparent',
      }}
    >
      {showDot && <span className="badge-dot" style={{ backgroundColor: meta.color }} />}
      {meta.label}
    </span>
  );
};

export default StatusBadge;

