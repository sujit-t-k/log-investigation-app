import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { createIncident } from '../../api/incidentsApi';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, PlusCircle } from 'lucide-react';

const CreateIncidentStandaloneModal = ({ isOpen, onClose, initialCorrelationId = '', onSuccess }) => {
  const toast = useToast();

  const [correlationId, setCorrelationId] = useState(initialCorrelationId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remediationPlan, setRemediationPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setCorrelationId(initialCorrelationId || '');
      setTitle('');
      setDescription('');
      setRemediationPlan('');
      setErrors({});
    }
  }, [isOpen, initialCorrelationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!correlationId.trim()) {
      newErrors.correlationId = 'Correlation ID is mandatory';
    } else if (correlationId.trim().length > 128) {
      newErrors.correlationId = 'Correlation ID must not exceed 128 characters';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is mandatory';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const data = {
        correlationId: correlationId.trim(),
        title: title.trim(),
        description: description.trim() || null,
        remediationPlan: remediationPlan.trim() || null,
      };

      const result = await createIncident(data);
      toast.success(`Incident #${result.id} registered successfully`);
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to register incident:', err);
      toast.error(err.message || 'Failed to register incident');
      if (err.responseData?.message) {
        setErrors({ general: err.responseData.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Platform Incident"
      maxWidth="600px"
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
            <PlusCircle size={15} />
            {submitting ? 'Registering...' : 'Register Incident'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
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
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="newCorrId">
            Correlation ID <span className="form-label-required">*</span>
          </label>
          <input
            id="newCorrId"
            type="text"
            className="form-input"
            value={correlationId}
            onChange={(e) => setCorrelationId(e.target.value)}
            placeholder="e.g. 8f5b3a12-8e11-4e78-98e3-0d53c5e8b091"
            style={{ fontFamily: 'var(--font-mono)' }}
            maxLength={128}
          />
          {errors.correlationId && <span className="form-error">{errors.correlationId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newTitle">
            Incident Title <span className="form-label-required">*</span>
          </label>
          <input
            id="newTitle"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Payment Gateway Connection Timeout"
            maxLength={255}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newDescription">
            Description (Optional)
          </label>
          <textarea
            id="newDescription"
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Observed error symptoms, user impact, affected endpoints..."
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newRemediation">
            Remediation Plan (Optional)
          </label>
          <textarea
            id="newRemediation"
            className="form-textarea"
            rows={3}
            value={remediationPlan}
            onChange={(e) => setRemediationPlan(e.target.value)}
            placeholder="Proposed fix, verification checklist, rollback strategy..."
          />
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FAF5FF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #E9D5FF',
            fontSize: '0.8125rem',
            color: 'var(--primary-deep)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} color="var(--primary-purple)" />
          <span>
            The incident will be created with initial status{' '}
            <strong>INCIDENT_IDENTIFIED</strong>. Status progression follows the mandatory lifecycle.
          </span>
        </div>
      </form>
    </Modal>
  );
};

export default CreateIncidentStandaloneModal;

