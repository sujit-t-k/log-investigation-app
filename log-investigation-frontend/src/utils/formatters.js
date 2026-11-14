/**
 * Utility helpers for formatting dates, numbers, log levels, and incident statuses.
 */

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return String(dateStr);
  }
};

export const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '—';
  }
};

/**
 * Format log levels with standardized classes and colors
 */
export const getLogLevelMeta = (level) => {
  const norm = (level || '').toUpperCase().trim();

  switch (norm) {
    case 'ERROR':
    case 'FATAL':
    case 'CRITICAL':
      return {
        label: norm || 'ERROR',
        color: 'var(--status-error)',
        bg: 'var(--status-error-bg)',
        border: 'var(--status-error-border)',
        variant: 'error',
      };
    case 'WARN':
    case 'WARNING':
      return {
        label: norm || 'WARN',
        color: 'var(--status-warn)',
        bg: 'var(--status-warn-bg)',
        border: 'var(--status-warn-border)',
        variant: 'warning',
      };
    case 'INFO':
      return {
        label: norm || 'INFO',
        color: 'var(--status-info)',
        bg: 'var(--status-info-bg)',
        border: 'var(--status-info-border)',
        variant: 'info',
      };
    case 'DEBUG':
    case 'TRACE':
      return {
        label: norm || 'DEBUG',
        color: 'var(--status-debug)',
        bg: 'var(--status-debug-bg)',
        border: 'var(--status-debug-border)',
        variant: 'debug',
      };
    default:
      return {
        label: norm || 'UNKNOWN',
        color: 'var(--text-secondary)',
        bg: 'var(--bg-subtle)',
        border: 'var(--border-color)',
        variant: 'default',
      };
  }
};

/**
 * Incident lifecycle specification:
 * INCIDENT_IDENTIFIED -> REMEDIATION_DEFINED -> REMEDIATION_IN_PROGRESS -> RESOLVED
 */
export const INCIDENT_LIFECYCLE = [
  {
    key: 'INCIDENT_IDENTIFIED',
    label: 'Incident Identified',
    step: 1,
    description: 'Incident detected and registered in system',
    nextStatus: 'REMEDIATION_DEFINED',
    nextLabel: 'Define Remediation',
  },
  {
    key: 'REMEDIATION_DEFINED',
    label: 'Remediation Defined',
    step: 2,
    description: 'Fix or mitigation strategy formulated',
    nextStatus: 'REMEDIATION_IN_PROGRESS',
    nextLabel: 'Start Remediation',
  },
  {
    key: 'REMEDIATION_IN_PROGRESS',
    label: 'Remediation In Progress',
    step: 3,
    description: 'Remediation actions are actively underway',
    nextStatus: 'RESOLVED',
    nextLabel: 'Mark as Resolved',
  },
  {
    key: 'RESOLVED',
    label: 'Resolved',
    step: 4,
    description: 'Root cause addressed and verification complete',
    nextStatus: null,
    nextLabel: null,
  },
];

export const getIncidentStatusMeta = (status) => {
  const norm = (status || '').toUpperCase().trim();
  const stepObj = INCIDENT_LIFECYCLE.find((s) => s.key === norm);

  switch (norm) {
    case 'INCIDENT_IDENTIFIED':
      return {
        key: norm,
        label: 'Incident Identified',
        step: 1,
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        nextStatus: 'REMEDIATION_DEFINED',
        nextAction: 'Define Remediation',
      };
    case 'REMEDIATION_DEFINED':
      return {
        key: norm,
        label: 'Remediation Defined',
        step: 2,
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
        nextStatus: 'REMEDIATION_IN_PROGRESS',
        nextAction: 'Start Remediation',
      };
    case 'REMEDIATION_IN_PROGRESS':
      return {
        key: norm,
        label: 'Remediation In Progress',
        step: 3,
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        nextStatus: 'RESOLVED',
        nextAction: 'Resolve Incident',
      };
    case 'RESOLVED':
      return {
        key: norm,
        label: 'Resolved',
        step: 4,
        color: '#16A34A',
        bg: '#F0FDF4',
        border: '#BBF7D0',
        nextStatus: null,
        nextAction: null,
      };
    default:
      return {
        key: norm,
        label: norm || 'Unknown',
        step: 0,
        color: 'var(--text-secondary)',
        bg: 'var(--bg-subtle)',
        border: 'var(--border-color)',
        nextStatus: null,
        nextAction: null,
      };
  }
};

/**
 * Format HTTP status badge styling
 */
export const getHttpStatusMeta = (statusCode) => {
  if (!statusCode) return { label: '—', color: 'var(--text-muted)', bg: 'transparent' };
  const code = Number(statusCode);

  if (code >= 200 && code < 300) {
    return { label: String(code), color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' };
  } else if (code >= 300 && code < 400) {
    return { label: String(code), color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
  } else if (code >= 400 && code < 500) {
    return { label: String(code), color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
  } else if (code >= 500) {
    return { label: String(code), color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
  }
  return { label: String(code), color: 'var(--text-secondary)', bg: 'var(--bg-subtle)', border: 'var(--border-color)' };
};

/**
 * Format execution time seconds to readable string
 */
export const formatDuration = (val) => {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);

  if (num < 1) {
    return `${Math.round(num * 1000)} ms`;
  }
  return `${num.toFixed(3)} s`;
};

/**
 * Copy string helper returning boolean success
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
};

