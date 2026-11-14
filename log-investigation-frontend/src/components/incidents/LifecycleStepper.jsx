import React from 'react';
import { Check, Clock, AlertTriangle, Hammer, CheckCircle2 } from 'lucide-react';
import { INCIDENT_LIFECYCLE } from '../../utils/formatters';

const STEP_ICONS = {
  INCIDENT_IDENTIFIED: AlertTriangle,
  REMEDIATION_DEFINED: Clock,
  REMEDIATION_IN_PROGRESS: Hammer,
  RESOLVED: CheckCircle2,
};

const LifecycleStepper = ({ currentStatus, resolvedAt }) => {
  const currentIndex = INCIDENT_LIFECYCLE.findIndex((s) => s.key === currentStatus);

  return (
    <div className="lifecycle-stepper-container" style={{ padding: '1rem 0' }}>
      <div
        className="lifecycle-stepper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Progress bar background line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            right: '5%',
            height: '3px',
            backgroundColor: 'var(--border-color)',
            zIndex: 1,
          }}
        />

        {/* Active progress fill line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            width: currentIndex >= 0 ? `${(currentIndex / (INCIDENT_LIFECYCLE.length - 1)) * 90}%` : '0%',
            height: '3px',
            backgroundColor: currentStatus === 'RESOLVED' ? 'var(--status-success)' : 'var(--primary-purple)',
            zIndex: 2,
            transition: 'width 0.4s ease',
          }}
        />

        {INCIDENT_LIFECYCLE.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          const StepIcon = STEP_ICONS[step.key] || Clock;

          let circleBg = 'var(--bg-surface)';
          let circleColor = 'var(--text-muted)';
          let circleBorder = 'var(--border-color)';
          let labelColor = 'var(--text-secondary)';

          if (isCompleted) {
            circleBg = 'var(--status-success-bg)';
            circleColor = 'var(--status-success)';
            circleBorder = 'var(--status-success)';
            labelColor = 'var(--text-primary)';
          } else if (isCurrent) {
            circleBg = step.key === 'RESOLVED' ? 'var(--status-success)' : 'var(--primary-purple)';
            circleColor = '#FFFFFF';
            circleBorder = step.key === 'RESOLVED' ? 'var(--status-success)' : 'var(--primary-purple)';
            labelColor = step.key === 'RESOLVED' ? 'var(--status-success)' : 'var(--primary-purple)';
          }

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 3,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  color: circleColor,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(124, 58, 237, 0.18)' : 'var(--shadow-sm)',
                  transition: 'all var(--transition-normal)',
                }}
              >
                {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <StepIcon size={18} />}
              </div>

              <div
                style={{
                  marginTop: '0.65rem',
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: labelColor,
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifecycleStepper;

