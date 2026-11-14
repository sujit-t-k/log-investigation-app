import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  RotateCcw,
  Copy,
  Check,
  Eye,
  Radio,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getIncidents, updateIncidentStatus } from '../api/incidentsApi';
import CreateIncidentStandaloneModal from '../components/incidents/CreateIncidentStandaloneModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { formatDateTime, copyToClipboard, getIncidentStatusMeta } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'INCIDENT_IDENTIFIED', label: 'Incident Identified' },
  { value: 'REMEDIATION_DEFINED', label: 'Remediation Defined' },
  { value: 'REMEDIATION_IN_PROGRESS', label: 'Remediation In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const IncidentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext();

  const initialPage = parseInt(searchParams.get('page') || '0', 10);
  const initialSize = parseInt(searchParams.get('size') || '50', 10);
  const initialStatus = searchParams.get('status') || '';
  const initialCorrelationId = searchParams.get('correlationId') || '';

  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [correlationIdFilter, setCorrelationIdFilter] = useState(initialCorrelationId);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Confirm dialog for status advance
  const [confirmDialogState, setConfirmDialogState] = useState({
    isOpen: false,
    incident: null,
    targetStatus: null,
    targetLabel: null,
  });

  const fetchIncidentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        size,
        status: initialStatus || undefined,
        correlationId: initialCorrelationId || undefined,
      };

      const data = await getIncidents(params);
      setIncidents(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError(err.message || 'Failed to retrieve incidents list');
    } finally {
      setLoading(false);
    }
  }, [page, size, initialStatus, initialCorrelationId]);

  useEffect(() => {
    fetchIncidentsData();
  }, [fetchIncidentsData]);

  // Hook into topbar refresh
  useEffect(() => {
    if (outletContext?.setRefreshHandler) {
      outletContext.setRefreshHandler(() => fetchIncidentsData);
    }
    return () => {
      if (outletContext?.setRefreshHandler) {
        outletContext.setRefreshHandler(null);
      }
    };
  }, [outletContext, fetchIncidentsData]);

  // Sync state if URL changes
  useEffect(() => {
    setStatusFilter(initialStatus);
    setCorrelationIdFilter(initialCorrelationId);
  }, [initialStatus, initialCorrelationId]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '0');
    params.set('size', size.toString());

    if (statusFilter) params.set('status', statusFilter);
    if (correlationIdFilter.trim()) params.set('correlationId', correlationIdFilter.trim());

    setPage(0);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setCorrelationIdFilter('');
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

  const handleCopy = async (text, id, e) => {
    e.stopPropagation();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      toast.success('Correlation ID copied');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAdvanceStatusPrompt = (incident, e) => {
    e.stopPropagation();
    const statusMeta = getIncidentStatusMeta(incident.status);
    if (!statusMeta.nextStatus) return;

    setConfirmDialogState({
      isOpen: true,
      incident,
      targetStatus: statusMeta.nextStatus,
      targetLabel: statusMeta.nextAction,
    });
  };

  const handleConfirmStatusAdvance = async () => {
    const { incident, targetStatus } = confirmDialogState;
    if (!incident || !targetStatus) return;

    try {
      await updateIncidentStatus(incident.id, targetStatus);
      toast.success(`Incident #${incident.id} advanced to ${targetStatus}`);
      setConfirmDialogState({ isOpen: false, incident: null, targetStatus: null, targetLabel: null });
      fetchIncidentsData();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Status transition was rejected by server');
    }
  };

  const hasActiveFilters = Boolean(statusFilter || correlationIdFilter);

  return (
    <div className="incidents-page">
      {/* Header */}
      <div
        className="page-header"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Incident Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Track, remediate, and resolve platform incidents with strict lifecycle integrity.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircle size={16} />
          Create Incident
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <form onSubmit={handleApplyFilters}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="incStatusFilter">
                Incident Lifecycle Status
              </label>
              <select
                id="incStatusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="incCorrIdFilter">
                Correlation ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="incCorrIdFilter"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  placeholder="Filter by UUID or trace..."
                  value={correlationIdFilter}
                  onChange={(e) => setCorrelationIdFilter(e.target.value)}
                />
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Filter size={14} />
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Data Table Container */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div style={{ padding: '1.5rem' }}>
            <ErrorState
              title="Unable to load incident records"
              message={error}
              onRetry={fetchIncidentsData}
            />
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              icon={AlertTriangle}
              title={hasActiveFilters ? 'No incidents match the active filters' : 'No incidents registered'}
              message={
                hasActiveFilters
                  ? 'Try selecting a different lifecycle status or clearing the correlation ID filter.'
                  : 'Platform health is optimal. No active or historic incidents have been registered.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Create First Incident'}
              onAction={hasActiveFilters ? handleResetFilters : () => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '0.875rem 1rem', width: '80px' }}>ID</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Title</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Correlation ID</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Created At</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Updated At</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => {
                    const statusMeta = getIncidentStatusMeta(inc.status);
                    const isCopied = copiedId === inc.id;

                    return (
                      <tr
                        key={inc.id}
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="table-row-hover"
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          cursor: 'pointer',
                          transition: 'background-color var(--transition-fast)',
                        }}
                      >
                        {/* ID */}
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                          #{inc.id}
                        </td>

                        {/* Title */}
                        <td style={{ padding: '0.875rem 1rem', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inc.title}>
                            {inc.title}
                          </div>
                          {inc.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                              {inc.description}
                            </div>
                          )}
                        </td>

                        {/* Correlation ID */}
                        <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Link
                              to={`/logs?correlationId=${encodeURIComponent(inc.correlationId)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="corr-id-link"
                              title="Investigate logs for this correlation ID"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                color: 'var(--primary-purple)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '2px',
                              }}
                            >
                              {inc.correlationId ? `${inc.correlationId.slice(0, 10)}...` : '—'}
                            </Link>
                            {inc.correlationId && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(inc.correlationId, inc.id, e)}
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

                        {/* Status */}
                        <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                          <StatusBadge type="incidentStatus" value={inc.status} />
                        </td>

                        {/* Created At */}
                        <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {formatDateTime(inc.createdAt)}
                        </td>

                        {/* Updated At */}
                        <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                          {formatDateTime(inc.updatedAt)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {statusMeta.nextStatus && (
                              <button
                                type="button"
                                onClick={(e) => handleAdvanceStatusPrompt(inc, e)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                title={`Advance status to ${statusMeta.nextStatus}`}
                              >
                                {statusMeta.nextAction}
                                <ArrowRight size={13} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => navigate(`/incidents/${inc.id}`)}
                              className="btn btn-outline btn-sm btn-icon"
                              title="View Incident Details"
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

            {/* Server-side Pagination */}
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
      <CreateIncidentStandaloneModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCorrelationId=""
        onSuccess={(newInc) => {
          fetchIncidentsData();
          navigate(`/incidents/${newInc.id}`);
        }}
      />

      {/* Confirmation Dialog for Status Advance */}
      <ConfirmDialog
        isOpen={confirmDialogState.isOpen}
        onClose={() => setConfirmDialogState({ isOpen: false, incident: null, targetStatus: null, targetLabel: null })}
        onConfirm={handleConfirmStatusAdvance}
        title="Advance Incident Lifecycle Stage"
        message={`Are you sure you want to transition Incident #${confirmDialogState.incident?.id} from "${confirmDialogState.incident?.status}" to "${confirmDialogState.targetStatus}"? This step strictly advances the lifecycle and cannot be reversed.`}
        confirmLabel={confirmDialogState.targetLabel || 'Advance Status'}
        isDangerous={confirmDialogState.targetStatus === 'RESOLVED'}
      />
    </div>
  );
};

export default IncidentsPage;

