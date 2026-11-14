import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const RawJsonViewer = ({ rawLog, title = 'Raw Log Payload' }) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  let formattedJson = '';
  let isJson = false;

  if (rawLog) {
    if (typeof rawLog === 'object') {
      formattedJson = JSON.stringify(rawLog, null, 2);
      isJson = true;
    } else {
      try {
        const parsed = JSON.parse(rawLog);
        formattedJson = JSON.stringify(parsed, null, 2);
        isJson = true;
      } catch {
        formattedJson = String(rawLog);
        isJson = false;
      }
    }
  }

  const handleCopy = async () => {
    if (!formattedJson) return;
    const success = await copyToClipboard(formattedJson);
    if (success) {
      setCopied(true);
      toast.success('Raw log payload copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        className="card-header"
        style={{
          backgroundColor: '#1E1B2E',
          color: '#EDE9FE',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid #332C4A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <Code2 size={16} color="var(--accent-yellow)" />
          <span>{title}</span>
          <span style={{ fontSize: '0.75rem', color: '#9F95BA', fontWeight: 400 }}>
            {isJson ? '(Formatted JSON)' : '(Plain Text)'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!formattedJson}
          className="btn btn-sm"
          style={{
            backgroundColor: '#302A45',
            color: '#FFFFFF',
            border: '1px solid #473E66',
            padding: '0.3rem 0.65rem',
            fontSize: '0.75rem',
          }}
          title="Copy payload to clipboard"
        >
          {copied ? <Check size={14} color="#4ADE80" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Payload'}</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#151320',
          padding: '1.25rem',
          maxHeight: '450px',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
      >
        {formattedJson ? (
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: '#D8D4E5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
            }}
          >
            {formattedJson}
          </pre>
        ) : (
          <span style={{ color: '#7E7699', fontStyle: 'italic', fontSize: '0.8125rem' }}>
            No raw payload available for this log record.
          </span>
        )}
      </div>
    </div>
  );
};

export default RawJsonViewer;

