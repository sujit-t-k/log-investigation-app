import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { updateIncident } from '../../api/incidentsApi';
import { useToast } from '../../context/ToastContext';
import { Save } from 'lucide-react';

const EditIncidentModal = ({ isOpen, onClose, incident, onSuccess }) => {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remediationPlan, setRemediationPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (incident && isOpen) {
      setTitle(incident.title || '');
      setDescription(incident.description || '');
      setRemediationPlan(incident.remediationPlan || '');
      setErrors({});
    }
  }, [incident, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title must not be empty';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const data = {
        title: title.trim(),
        description: description.trim() || null,
        remediationPlan: remediationPlan.trim() || null,
      };

      const updated = await updateIncident(incident.id, data);
      toast.success('Incident metadata updated successfully');
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update incident:', err);
      toast.error(err.message || 'Failed to update incident metadata');
      if (err.responseData?.message) {
        setErrors({ general: err.responseData.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Incident #${incident?.id} Metadata`}
      maxWidth="600px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
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
          <label className="form-label" htmlFor="editTitle">
            Incident Title <span className="form-label-required">*</span>
          </label>
          <input
            id="editTitle"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="editDesc">
            Description
          </label>
          <textarea
            id="editDesc"
            className="form-textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of symptoms, error logs, and impact..."
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="editRem">
            Remediation Plan
          </label>
          <textarea
            id="editRem"
            className="form-textarea"
            rows={3}
            value={remediationPlan}
            onChange={(e) => setRemediationPlan(e.target.value)}
            placeholder="Mitigation steps, patch deployment, or roll-forward steps..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditIncidentModal;

