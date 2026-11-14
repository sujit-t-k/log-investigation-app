import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowRight,
  FileText,
  Hammer
} from 'lucide-react';
import { getIncidentById, updateIncidentStatus } from '../api/incidentsApi';
import LifecycleStepper from '../components/incidents/LifecycleStepper';
import EditIncidentModal from '../components/incidents/EditIncidentModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { formatDateTime, copyToClipboard, getIncidentStatusMeta } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit metadata modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Confirm dialog for status transition
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedCorrId, setCopiedCorrId] = useState(false);

  const fetchIncidentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIncidentById(id);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident:', err);
      setError(err.message || `Incident #${id} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  // Hook into topbar refresh
  useEffect(() => {
    if (outletContext?.setRefreshHandler) {
      outletContext.setRefreshHandler(() => fetchIncidentDetails);
    }
    return () => {
      if (outletContext?.setRefreshHandler) {
        outletContext.setRefreshHandler(null);
      }
    };
  }, [outletContext, fetchIncidentDetails]);

  const handleCopyCorrelationId = async () => {
    if (!incident?.correlationId) return;
    const ok = await copyToClipboard(incident.correlationId);
    if (ok) {
      setCopiedCorrId(true);
      toast.success('Correlation ID copied');
      setTimeout(() => setCopiedCorrId(false), 2000);
    }
  };

  const handleStatusTransitionConfirm = async () => {
    const statusMeta = getIncidentStatusMeta(incident.status);
    if (!statusMeta.nextStatus) return;

    try {
      setIsUpdatingStatus(true);
      const updated = await updateIncidentStatus(incident.id, statusMeta.nextStatus);
      toast.success(`Incident #${incident.id} transitioned to ${updated.status}`);
      setIncident(updated);
      setIsConfirmOpen(false);
    } catch (err) {
      console.error('Status transition failed:', err);
      toast.error(err.message || 'Status transition was rejected by server');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text={`Loading Incident #${id} details and audit timeline...`} />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto' }}>
        <ErrorState
          title="Incident Not Found"
          message={error}
          onRetry={fetchIncidentDetails}
        />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/incidents')}
          >
            <ArrowLeft size={14} />
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  const statusMeta = getIncidentStatusMeta(incident.status);
  const isResolved = incident.status === 'RESOLVED';
  const hasNextStatus = Boolean(statusMeta.nextStatus);

  return (
    <div className="incident-details-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Navigation & Action Controls */}
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
            onClick={() => navigate('/incidents')}
          >
            <ArrowLeft size={16} />
            All Incidents
          </button>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Incident #{incident.id}
          </h1>

          <StatusBadge type="incidentStatus" value={incident.status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setIsEditModalOpen(true)}
            title="Edit incident title, description, or remediation plan"
          >
            <Edit3 size={15} />
            Edit Metadata
          </button>

          {/* Next Lifecycle Transition Action */}
          {hasNextStatus ? (
            <button
              type="button"
              className={statusMeta.nextStatus === 'RESOLVED' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setIsConfirmOpen(true)}
              style={
                statusMeta.nextStatus === 'RESOLVED'
                  ? { backgroundColor: 'var(--status-success)', color: '#FFFFFF', borderColor: 'transparent' }
                  : {}
              }
            >
              <span>{statusMeta.nextAction}</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--status-success-border)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Incident Fully Resolved</span>
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle Stepper Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Resolution Lifecycle Progress
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Strict Progression Rule: Identified → Remediation Defined → In Progress → Resolved
          </span>
        </div>

        <LifecycleStepper
          currentStatus={incident.status}
          resolvedAt={incident.resolvedAt}
        />
      </div>

      {/* Incident Title & Header Details Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Incident Title
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {incident.title}
          </h2>
        </div>

        {/* Correlation ID Banner with Direct Investigation Link */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Investigated Correlation ID
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                {incident.correlationId}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm btn-icon"
                style={{ padding: '0.2rem', height: '26px', width: '26px' }}
                onClick={handleCopyCorrelationId}
                title="Copy Correlation ID"
              >
                {copiedCorrId ? <Check size={13} color="var(--status-success)" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <Link
            to={`/logs?correlationId=${encodeURIComponent(incident.correlationId)}`}
            className="btn btn-secondary btn-sm"
          >
            <Radio size={14} color="var(--primary-purple)" />
            Investigate Related Logs
          </Link>
        </div>
      </div>

      {/* Description & Remediation Plan 2-Col Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Description Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileText size={18} color="var(--primary-purple)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Incident Description &amp; Symptoms
            </h3>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: incident.description ? 'var(--text-primary)' : 'var(--text-muted)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {incident.description || 'No detailed description provided.'}
          </div>
        </div>

        {/* Remediation Plan Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Hammer size={18} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Remediation &amp; Mitigation Strategy
            </h3>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: incident.remediationPlan ? 'var(--text-primary)' : 'var(--text-muted)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {incident.remediationPlan || 'No remediation plan documented yet. Use "Edit Metadata" to define.'}
          </div>
        </div>
      </div>

      {/* Audit & Timestamps Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={17} color="var(--primary-purple)" />
          Audit &amp; Timeline Records
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Creation Timestamp</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {formatDateTime(incident.createdAt)}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Last Updated</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {formatDateTime(incident.updatedAt)}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Resolution Timestamp</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: incident.resolvedAt ? 'var(--status-success)' : 'var(--text-muted)' }}>
              {formatDateTime(incident.resolvedAt)}
            </strong>
          </div>
        </div>
      </div>

      {/* Metadata Edit Modal */}
      <EditIncidentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        incident={incident}
        onSuccess={(updated) => {
          setIncident(updated);
        }}
      />

      {/* Status Transition Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleStatusTransitionConfirm}
        title="Confirm Status Transition"
        message={`Are you sure you want to transition Incident #${incident.id} to '${statusMeta.nextStatus}'? ${
          statusMeta.nextStatus === 'RESOLVED'
            ? 'Marking as Resolved is the terminal state and will record the resolution timestamp.'
            : 'This advances the lifecycle to the next engineering phase.'
        }`}
        confirmLabel={statusMeta.nextAction || 'Advance Status'}
        isLoading={isUpdatingStatus}
        isDangerous={statusMeta.nextStatus === 'RESOLVED'}
      />
    </div>
  );
};

export default IncidentDetailsPage;

