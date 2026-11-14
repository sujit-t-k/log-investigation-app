import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Clock,
  Server,
  Terminal,
  Globe,
  Radio,
  FileCode,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { getLogById } from '../api/logsApi';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import RawJsonViewer from '../components/logs/RawJsonViewer';
import CreateIncidentModal from '../components/logs/CreateIncidentModal';
import { formatDateTime, formatDuration, copyToClipboard } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const LogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext();

  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const fetchLogDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLogById(id);
      setLog(data);
    } catch (err) {
      console.error('Failed to load log record:', err);
      setError(err.message || `Log record with ID #${id} was not found.`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLogDetails();
  }, [fetchLogDetails]);

  // Hook into topbar refresh
  useEffect(() => {
    if (outletContext?.setRefreshHandler) {
      outletContext.setRefreshHandler(() => fetchLogDetails);
    }
    return () => {
      if (outletContext?.setRefreshHandler) {
        outletContext.setRefreshHandler(null);
      }
    };
  }, [outletContext, fetchLogDetails]);

  const handleCopy = async (text, fieldName) => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Retrieving detailed log telemetry and raw payload..." />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
        <ErrorState
          title="Log Record Not Found"
          message={error}
          onRetry={fetchLogDetails}
        />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/logs')}
          >
            <ArrowLeft size={14} />
            Back to Log Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="log-details-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/logs')}
            title="Return to logs list"
          >
            <ArrowLeft size={16} />
            Back to Logs
          </button>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Log Event #{log.id}
          </h1>
          <StatusBadge type="logLevel" value={log.logLevel} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {log.correlationId && (
            <Link
              to={`/logs?correlationId=${encodeURIComponent(log.correlationId)}`}
              className="btn btn-outline btn-sm"
              title="Filter all logs matching this correlation ID"
            >
              <Radio size={14} color="var(--primary-purple)" />
              Trace Correlation ID
            </Link>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsIncidentModalOpen(true)}
            title="Open incident registration dialog pre-filled with this log"
          >
            <AlertTriangle size={15} />
            Create Incident
          </button>
        </div>
      </div>

      {/* Main Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Core Event Overview Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} color="var(--primary-purple)" />
            Service &amp; Execution Context
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Event Timestamp</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatDateTime(log.eventTimestamp)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Service Name</span>
              <strong style={{ color: 'var(--primary-deep)' }}>{log.serviceName || '—'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Log Source</span>
              <span>{log.logSource || '—'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Logger Name</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{log.loggerName || '—'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Thread</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {log.threadName || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Network & HTTP Transaction Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--primary-purple)" />
            HTTP Request &amp; Performance
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HTTP Status</span>
              {log.httpStatus ? (
                <StatusBadge type="httpStatus" value={log.httpStatus} showDot={false} />
              ) : (
                <span>—</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HTTP Method &amp; Operation</span>
              <span>
                {log.httpMethod && <strong>{log.httpMethod} </strong>}
                {log.operation || '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Request URI</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.requestUri}>
                {log.requestUri || '—'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Request Duration</span>
              <span style={{ fontWeight: 600 }}>{formatDuration(log.requestTime)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Upstream Response Time</span>
              <span style={{ fontWeight: 600 }}>{formatDuration(log.upstreamResponseTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation ID & Client Context Banner */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#FAF8FE',
          borderColor: '#E2D9F3',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Distributed Correlation ID
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                {log.correlationId || 'No correlation ID attached'}
              </span>
              {log.correlationId && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-icon"
                  style={{ padding: '0.25rem', height: '28px', width: '28px' }}
                  onClick={() => handleCopy(log.correlationId, 'Correlation ID')}
                  title="Copy Correlation ID"
                >
                  {copiedField === 'Correlation ID' ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Client IP</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{log.clientIp || '—'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>User Agent</span>
              <span style={{ maxWidth: '280px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent}>
                {log.userAgent || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Message Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Log Message
        </h2>
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {log.message || 'No log message recorded.'}
        </div>
      </div>

      {/* Complete Raw JSON Payload Viewer */}
      <div style={{ marginBottom: '2rem' }}>
        <RawJsonViewer rawLog={log.rawLog} title="Complete Raw Payload (rawLog)" />
      </div>

      {/* Create Incident Modal */}
      <CreateIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        log={log}
        onSuccess={(newInc) => {
          navigate(`/incidents/${newInc.id}`);
        }}
      />
    </div>
  );
};

export default LogDetailsPage;

