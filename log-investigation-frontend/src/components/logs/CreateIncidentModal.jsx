import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { createIncident } from '../../api/incidentsApi';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Send } from 'lucide-react';

const CreateIncidentModal = ({ isOpen, onClose, log, onSuccess }) => {
  const toast = useToast();

  const [correlationId, setCorrelationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remediationPlan, setRemediationPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (log && isOpen) {
      setCorrelationId(log.correlationId || '');
      // Suggest a descriptive title
      const defaultTitle = log.operation
        ? `[${log.serviceName || 'Service'}] Failure in ${log.operation}`
        : log.message
        ? `[${log.serviceName || 'Service'}] ${log.message.slice(0, 60)}...`
        : `Incident on ${log.serviceName || 'System'}`;
      setTitle(defaultTitle);

      const defaultDesc = [
        `Service: ${log.serviceName || 'Unknown'}`,
        `Log Level: ${log.logLevel || 'Unknown'}`,
        `Message: ${log.message || 'None'}`,
        log.requestUri ? `Request URI: ${log.requestUri}` : null,
        log.httpStatus ? `HTTP Status: ${log.httpStatus}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      setDescription(defaultDesc);
      setRemediationPlan('');
      setValidationErrors({});
    }
  }, [log, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!correlationId.trim()) {
      errors.correlationId = 'Correlation ID is mandatory';
    }
    if (!title.trim()) {
      errors.title = 'Title is mandatory';
    } else if (title.trim().length > 255) {
      errors.title = 'Title must not exceed 255 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setValidationErrors({});

      const payload = {
        correlationId: correlationId.trim(),
        title: title.trim(),
        description: description.trim() || null,
        remediationPlan: remediationPlan.trim() || null,
      };

      const newIncident = await createIncident(payload);
      toast.success(`Incident #${newIncident.id} created with status INCIDENT_IDENTIFIED`);
      if (onSuccess) {
        onSuccess(newIncident);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create incident:', err);
      toast.error(err.message || 'Failed to create incident');
      if (err.responseData?.message) {
        setValidationErrors({ general: err.responseData.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Incident from Log"
      maxWidth="620px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Send size={15} />
            {submitting ? 'Creating Incident...' : 'Create Incident'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {validationErrors.general && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-error)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {validationErrors.general}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="corrId">
            Correlation ID <span className="form-label-required">*</span>
          </label>
          <input
            id="corrId"
            type="text"
            className="form-input"
            value={correlationId}
            onChange={(e) => setCorrelationId(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            style={{ fontFamily: 'var(--font-mono)' }}
            readOnly
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Automatically locked to the investigated log record.
          </span>
          {validationErrors.correlationId && (
            <span className="form-error">{validationErrors.correlationId}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="incTitle">
            Incident Title <span className="form-label-required">*</span>
          </label>
          <input
            id="incTitle"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief, descriptive summary of the incident"
            maxLength={255}
          />
          {validationErrors.title && (
            <span className="form-error">{validationErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="incDesc">
            Description
          </label>
          <textarea
            id="incDesc"
            className="form-textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed symptoms, observed errors, and affected subsystems..."
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="incRem">
            Remediation Plan
          </label>
          <textarea
            id="incRem"
            className="form-textarea"
            rows={3}
            value={remediationPlan}
            onChange={(e) => setRemediationPlan(e.target.value)}
            placeholder="Action items, rollback steps, or engineering mitigations..."
          />
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEF3C7',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FDE68A',
            fontSize: '0.8125rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} color="#D97706" />
          <span>
            Initial Status will strictly be registered as{' '}
            <strong>INCIDENT_IDENTIFIED</strong> according to platform lifecycle rules.
          </span>
        </div>
      </form>
    </Modal>
  );
};

export default CreateIncidentModal;

