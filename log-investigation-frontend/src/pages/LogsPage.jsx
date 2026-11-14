import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  ExternalLink,
  Search,
  FilterX
} from 'lucide-react';
import { getLogs } from '../api/logsApi';
import LogFilterBar from '../components/logs/LogFilterBar';
import CreateIncidentModal from '../components/logs/CreateIncidentModal';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { formatDateTime, copyToClipboard } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const LogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext();

  // Extract initial query parameters from URL
  const initialPage = parseInt(searchParams.get('page') || '0', 10);
  const initialSize = parseInt(searchParams.get('size') || '50', 10);
  const initialCorrelationId = searchParams.get('correlationId') || '';
  const initialLevel = searchParams.get('level') || '';
  const initialSource = searchParams.get('source') || '';
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';

  // Local state
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for incident creation
  const [selectedLogForIncident, setSelectedLogForIncident] = useState(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Copied correlation ID feedback
  const [copiedCorrId, setCopiedCorrId] = useState(null);

  // Fetch logs with current filters and pagination
  const fetchLogsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size,
        correlationId: initialCorrelationId || undefined,
        level: initialLevel || undefined,
        source: initialSource || undefined,
        from: initialFrom || undefined,
        to: initialTo || undefined,
      };

      const data = await getLogs(params);
      setLogs(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError(err.message || 'Failed to retrieve application logs');
    } finally {
      setLoading(false);
    }
  }, [page, size, initialCorrelationId, initialLevel, initialSource, initialFrom, initialTo]);

  useEffect(() => {
    fetchLogsData();
  }, [fetchLogsData]);

  // Hook into topbar refresh
  useEffect(() => {
    if (outletContext?.setRefreshHandler) {
      outletContext.setRefreshHandler(() => fetchLogsData);
    }
    return () => {
      if (outletContext?.setRefreshHandler) {
        outletContext.setRefreshHandler(null);
      }
    };
  }, [outletContext, fetchLogsData]);

  // Handle filter changes (resets to page 0)
  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    params.set('page', '0');
    params.set('size', size.toString());

    if (newFilters.correlationId) params.set('correlationId', newFilters.correlationId);
    if (newFilters.level) params.set('level', newFilters.level);
    if (newFilters.source) params.set('source', newFilters.source);
    if (newFilters.from) params.set('from', newFilters.from);
    if (newFilters.to) params.set('to', newFilters.to);

    setPage(0);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '0');
    params.set('size', size.toString());
    setPage(0);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
    const params = new URLSearchParams(searchParams);
    params.set('page', '0');
    params.set('size', newSize.toString());
    setSearchParams(params);
  };

  const handleCopyCorrelationId = async (corrId, e) => {
    e.stopPropagation();
    if (!corrId) return;
    const ok = await copyToClipboard(corrId);
    if (ok) {
      setCopiedCorrId(corrId);
      toast.success('Correlation ID copied to clipboard');
      setTimeout(() => setCopiedCorrId(null), 2000);
    }
  };

  const handleFilterByCorrelationId = (corrId, e) => {
    e.stopPropagation();
    if (!corrId) return;
    const params = new URLSearchParams();
    params.set('correlationId', corrId);
    params.set('page', '0');
    params.set('size', size.toString());
    setPage(0);
    setSearchParams(params);
  };

  const handleOpenIncidentModal = (log, e) => {
    e.stopPropagation();
    setSelectedLogForIncident(log);
    setIsIncidentModalOpen(true);
  };

  return (
    <div className="logs-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Log Explorer
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Inspect, filter, and trace distributed logs across platform microservices.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <LogFilterBar
        initialFilters={{
          correlationId: initialCorrelationId,
          level: initialLevel,
          source: initialSource,
          from: initialFrom,
          to: initialTo,
        }}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table / Data Area */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : error ? (
          <div style={{ padding: '1.5rem' }}>
            <ErrorState
              title="Unable to load log stream"
              message={error}
              onRetry={fetchLogsData}
            />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              icon={initialCorrelationId || initialLevel || initialSource ? FilterX : Search}
              title={
                initialCorrelationId || initialLevel || initialSource
                  ? 'No matching logs for current filters'
                  : 'No log events found'
              }
              message={
                initialCorrelationId || initialLevel || initialSource
                  ? 'Try relaxing your filter parameters, widening the time range, or clearing filters.'
                  : 'The log ingestion pipeline has not recorded events matching this query.'
              }
              actionLabel={
                initialCorrelationId || initialLevel || initialSource
                  ? 'Clear All Filters'
                  : undefined
              }
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>Timestamp</th>
                    <th style={{ padding: '0.875rem 0.75rem', whiteSpace: 'nowrap' }}>Level</th>
                    <th style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>Service / Source</th>
                    <th style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>Correlation ID</th>
                    <th style={{ padding: '0.875rem 1rem', minWidth: '240px' }}>Message</th>
                    <th style={{ padding: '0.875rem 0.75rem', whiteSpace: 'nowrap' }}>Operation</th>
                    <th style={{ padding: '0.875rem 0.75rem', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isCopied = copiedCorrId === log.correlationId;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => navigate(`/logs/${log.id}`)}
                        className="table-row-hover"
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          cursor: 'pointer',
                          transition: 'background-color var(--transition-fast)',
                        }}
                      >
                        {/* Event Timestamp */}
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {formatDateTime(log.eventTimestamp)}
                        </td>

                        {/* Log Level */}
                        <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>
                          <StatusBadge type="logLevel" value={log.logLevel} />
                        </td>

                        {/* Service / Source */}
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {log.serviceName || '—'}
                          </div>
                          {log.logSource && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {log.logSource}
                            </div>
                          )}
                        </td>

                        {/* Correlation ID with Investigation Click and Copy */}
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="corr-id-link"
                              onClick={(e) => handleFilterByCorrelationId(log.correlationId, e)}
                              title="Filter logs by this Correlation ID"
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '0.15rem 0.35rem',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                color: 'var(--primary-purple)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                textUnderlineOffset: '2px',
                              }}
                            >
                              {log.correlationId ? `${log.correlationId.slice(0, 10)}...` : '—'}
                            </button>

                            {log.correlationId && (
                              <button
                                type="button"
                                onClick={(e) => handleCopyCorrelationId(log.correlationId, e)}
                                title="Copy Correlation ID"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isCopied ? 'var(--status-success)' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.2rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Message */}
                        <td style={{ padding: '0.75rem 1rem', maxWidth: '380px' }}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--text-primary)',
                            }}
                            title={log.message}
                          >
                            {log.message || '—'}
                          </div>
                        </td>

                        {/* Operation */}
                        <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                          {log.httpMethod && (
                            <span style={{ fontWeight: 600, color: 'var(--primary-deep)', marginRight: '0.3rem', fontSize: '0.7rem' }}>
                              {log.httpMethod}
                            </span>
                          )}
                          <span>{log.operation || '—'}</span>
                        </td>

                        {/* HTTP Status */}
                        <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap' }}>
                          {log.httpStatus ? (
                            <StatusBadge type="httpStatus" value={log.httpStatus} showDot={false} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenIncidentModal(log, e)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', gap: '0.3rem' }}
                              title="Create Incident from this Log"
                            >
                              <AlertTriangle size={13} color="var(--primary-deep)" />
                              Incident
                            </button>

                            <button
                              type="button"
                              onClick={() => navigate(`/logs/${log.id}`)}
                              className="btn btn-outline btn-sm btn-icon"
                              title="Inspect Full Log Details"
                              style={{ padding: '0.35rem' }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Server-side Pagination Component */}
            <Pagination
              page={page}
              size={size}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          </>
        )}
      </div>

      {/* Create Incident Modal */}
      {selectedLogForIncident && (
        <CreateIncidentModal
          isOpen={isIncidentModalOpen}
          onClose={() => {
            setIsIncidentModalOpen(false);
            setSelectedLogForIncident(null);
          }}
          log={selectedLogForIncident}
          onSuccess={(newInc) => {
            toast.success(`Incident #${newInc.id} registered`);
          }}
        />
      )}
    </div>
  );
};

export default LogsPage;

