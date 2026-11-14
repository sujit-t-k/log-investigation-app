import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  page = 0,
  size = 50,
  totalElements = 0,
  totalPages = 0,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}) => {
  const currentPageDisplay = totalElements === 0 ? 0 : page + 1;
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div
      className={`pagination-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.875rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> -{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{totalElements.toLocaleString()}</strong> results
        </span>

        {onSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.75rem' }}>
            <label htmlFor="pageSizeSelect" style={{ fontSize: '0.8125rem' }}>Per page:</label>
            <select
              id="pageSizeSelect"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="form-select"
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.8125rem',
                width: 'auto',
                height: '32px',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ marginRight: '0.5rem' }}>
          Page <strong style={{ color: 'var(--text-primary)' }}>{currentPageDisplay}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{Math.max(totalPages, 1)}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
          className="btn btn-outline btn-sm btn-icon"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.35rem 0.75rem' }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.35rem 0.75rem' }}
        >
          Next
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canGoNext}
          className="btn btn-outline btn-sm btn-icon"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

