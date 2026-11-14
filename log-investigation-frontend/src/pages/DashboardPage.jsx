import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Database,
  Activity,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertTriangle,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getDashboardSummary } from '../api/dashboardApi';
import StatCard from '../components/dashboard/StatCard';
import { CardSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import { useToast } from '../context/ToastContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (isManualRefresh = false) => {
    try {
      if (!isManualRefresh) setLoading(true);
      setError(null);
      const data = await getDashboardSummary();
      setSummary(data);
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed successfully');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
      setError(err.message || 'Failed to retrieve dashboard metrics');
      if (isManualRefresh) {
        toast.error('Failed to refresh dashboard summary');
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Register topbar refresh handler
  useEffect(() => {
    if (outletContext?.setRefreshHandler) {
      outletContext.setRefreshHandler(() => () => fetchSummary(true));
    }
    return () => {
      if (outletContext?.setRefreshHandler) {
        outletContext.setRefreshHandler(null);
      }
    };
  }, [outletContext, fetchSummary]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header-skeleton" style={{ marginBottom: '1.5rem' }}>
          <div style={{ height: '28px', width: '220px', backgroundColor: '#E5DFEE', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '380px', backgroundColor: '#F1EEF6', borderRadius: '4px' }} />
        </div>
        <div className="stats-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <ErrorState
          title="Unable to load Dashboard Overview"
          message={error}
          onRetry={() => fetchSummary(false)}
        />
      </div>
    );
  }

  // Calculate incident status metrics
  const totalIncidents = summary?.totalIncidents || 0;
  const resolvedIncidents = summary?.resolvedIncidents || 0;
  const pendingIncidents = summary?.pendingIncidents || 0;
  const inProgressIncidents = summary?.inProgressIncidents || 0;
  const totalLogs = summary?.totalLogs || 0;

  // Identified / awaiting remediation: pending minus inProgress
  const identifiedIncidents = Math.max(0, pendingIncidents - inProgressIncidents);

  const resolutionRate = totalIncidents > 0
    ? ((resolvedIncidents / totalIncidents) * 100).toFixed(1)
    : '0.0';

  // Prepare chart data only when total incidents > 0
  const chartData = [
    { name: 'Resolved', value: resolvedIncidents, color: '#16A34A' },
    { name: 'In Progress', value: inProgressIncidents, color: '#2563EB' },
    { name: 'Identified / Pending', value: identifiedIncidents, color: '#DC2626' },
  ].filter((item) => item.value > 0);

  const hasChartData = chartData.length > 0;

  return (
    <div className="dashboard-page">
      {/* Header with Title and Quick Refresh */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Overview &amp; Incident Metrics
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Real-time platform telemetry, incident status progression, and log ingestion metrics.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fetchSummary(true)}
          title="Refresh summary data"
        >
          <RefreshCw size={15} />
          Reload Data
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Incidents"
          value={totalIncidents}
          subtitle="Cumulative platform issues"
          icon={AlertOctagon}
          color="var(--primary-purple)"
          bgLight="var(--primary-light)"
          onClick={() => navigate('/incidents')}
          badge="All records"
        />

        <StatCard
          title="Resolved Incidents"
          value={resolvedIncidents}
          subtitle={`${resolutionRate}% resolution efficiency`}
          icon={CheckCircle2}
          color="var(--status-success)"
          bgLight="var(--status-success-bg)"
          onClick={() => navigate('/incidents?status=RESOLVED')}
          badge="Closed"
        />

        <StatCard
          title="Pending Incidents"
          value={pendingIncidents}
          subtitle="Awaiting complete resolution"
          icon={Clock}
          color="var(--status-warn)"
          bgLight="var(--status-warn-bg)"
          onClick={() => navigate('/incidents')}
          badge="Active"
        />

        <StatCard
          title="In Progress"
          value={inProgressIncidents}
          subtitle="Active remediation underway"
          icon={Flame}
          color="#2563EB"
          bgLight="#EFF6FF"
          onClick={() => navigate('/incidents?status=REMEDIATION_IN_PROGRESS')}
          badge="Remediating"
        />

        <StatCard
          title="Total Logs Ingested"
          value={totalLogs}
          subtitle="Searchable telemetry records"
          icon={Database}
          color="var(--primary-deep)"
          bgLight="#EDE9FE"
          onClick={() => navigate('/logs')}
          badge="Data Lake"
        />
      </div>

      {/* Analytics & Navigation Shortcuts */}
      <div className="dashboard-grid-two-col" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

        {/* Incident Status Distribution Chart */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Incident Lifecycle Distribution
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Breakdown of active vs resolved platform incidents
              </span>
            </div>
            <ShieldCheck size={20} color="var(--primary-purple)" />
          </div>

          {hasChartData ? (
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val.toLocaleString()} incidents`, name]}
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '0.8125rem',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', gap: '0.5rem' }}>
              <Activity size={32} />
              <p style={{ fontSize: '0.875rem' }}>No incident metrics recorded yet.</p>
            </div>
          )}

          {/* Quick Metrics Progress bar */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overall Incident Resolution Rate</span>
              <strong style={{ color: 'var(--text-primary)' }}>{resolutionRate}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, Number(resolutionRate)))}%`,
                  height: '100%',
                  backgroundColor: 'var(--status-success)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Operations & Navigation Shortcuts */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Operational Quick Access
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Direct pathways into log investigation and incident remediation workflows.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                onClick={() => navigate('/logs')}
                className="shortcut-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary-purple)' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                      Log Explorer
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                      Search by correlation ID, level, or service source
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--primary-purple)" />
              </div>

              <div
                onClick={() => navigate('/incidents')}
                className="shortcut-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEE2E2', color: 'var(--status-error)' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                      Active Incidents
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                      Track status lifecycle and advance remediation stages
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--status-error)" />
              </div>

              <div
                onClick={() => navigate('/logs?level=ERROR')}
                className="shortcut-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF3C7', color: 'var(--accent-orange)' }}>
                    <Flame size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                      Investigate Error Logs
                    </strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                      Quickly filter to ERROR level events
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--accent-orange)" />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--primary-purple)" />
            <span><code>LogPulse</code> - Made by Sujit T K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

