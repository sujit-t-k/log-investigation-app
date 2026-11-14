import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Calendar, Check, AlertCircle } from 'lucide-react';

const LOG_LEVELS = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

const LogFilterBar = ({ initialFilters, onApplyFilters, onResetFilters }) => {
  const [correlationId, setCorrelationId] = useState(initialFilters.correlationId || '');
  const [level, setLevel] = useState(initialFilters.level || '');
  const [source, setSource] = useState(initialFilters.source || '');
  const [from, setFrom] = useState(initialFilters.from || '');
  const [to, setTo] = useState(initialFilters.to || '');
  const [dateError, setDateError] = useState('');

  // Synchronize when initialFilters change (e.g. via URL query param)
  useEffect(() => {
    setCorrelationId(initialFilters.correlationId || '');
    setLevel(initialFilters.level || '');
    setSource(initialFilters.source || '');
    setFrom(initialFilters.from || '');
    setTo(initialFilters.to || '');
    setDateError('');
  }, [initialFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate date boundaries if both are present
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (fromDate > toDate) {
        setDateError("Start time 'From' cannot be after end time 'To'");
        return;
      }
    }
    setDateError('');

    onApplyFilters({
      correlationId: correlationId.trim() || undefined,
      level: level && level !== 'ALL' ? level.trim() : undefined,
      source: source.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  };

  const handleClear = () => {
    setCorrelationId('');
    setLevel('');
    setSource('');
    setFrom('');
    setTo('');
    setDateError('');
    onResetFilters();
  };

  const hasActiveFilters = Boolean(
    correlationId || (level && level !== 'ALL') || source || from || to
  );

  return (
    <div
      className="card log-filter-bar"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Correlation ID */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filterCorrelationId">
              Correlation ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="filterCorrelationId"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                placeholder="UUID or trace ID..."
                value={correlationId}
                onChange={(e) => setCorrelationId(e.target.value)}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Log Level */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filterLevel">
              Log Level
            </label>
            <select
              id="filterLevel"
              className="form-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">All Log Levels</option>
              {LOG_LEVELS.filter((lvl) => lvl !== 'ALL').map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Log Source */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filterSource">
              Log Source / Service
            </label>
            <input
              id="filterSource"
              type="text"
              className="form-input"
              placeholder="e.g. order-service"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          {/* From Timestamp */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filterFrom">
              From Date &amp; Time
            </label>
            <input
              id="filterFrom"
              type="datetime-local"
              className="form-input"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setDateError('');
              }}
            />
          </div>

          {/* To Timestamp */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="filterTo">
              To Date &amp; Time
            </label>
            <input
              id="filterTo"
              type="datetime-local"
              className="form-input"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setDateError('');
              }}
            />
          </div>
        </div>

        {dateError && (
          <div
            style={{
              marginTop: '0.75rem',
              color: 'var(--status-error)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={15} />
            <span>{dateError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {hasActiveFilters ? (
              <span style={{ color: 'var(--primary-purple)', fontWeight: 500 }}>
                • Active filters applied
              </span>
            ) : (
              <span>Showing unfiltered stream</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClear}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            )}

            <button type="submit" className="btn btn-primary btn-sm">
              <Filter size={14} />
              Apply Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LogFilterBar;

