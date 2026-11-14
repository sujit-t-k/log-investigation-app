import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, RefreshCw, Bell, Shield, ChevronRight } from 'lucide-react';

const Topbar = ({ onOpenMobile, onRefresh, isRefreshing = false }) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return [{ label: 'Dashboard', to: '/dashboard' }];
    }
    if (path === '/logs') {
      return [{ label: 'Logs', to: '/logs' }];
    }
    if (path.startsWith('/logs/')) {
      const id = path.split('/')[2];
      return [
        { label: 'Logs', to: '/logs' },
        { label: `Log #${id}`, to: `/logs/${id}` },
      ];
    }
    if (path === '/incidents') {
      return [{ label: 'Incidents', to: '/incidents' }];
    }
    if (path.startsWith('/incidents/')) {
      const id = path.split('/')[2];
      return [
        { label: 'Incidents', to: '/incidents' },
        { label: `Incident #${id}`, to: `/incidents/${id}` },
      ];
    }
    return [{ label: 'Dashboard', to: '/dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onOpenMobile}
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.to}>
              {idx > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current">{crumb.label}</span>
              ) : (
                <Link to={crumb.to} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        {onRefresh && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh current view"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? 'animate-spin' : ''}
              style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}}
            />
            <span className="refresh-btn-text">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}

        <div className="topbar-divider" />

        {/* User Avatar Placeholder (no auth implied) */}
        <div className="avatar-placeholder" title="System Operator (Workstation)">
          <div className="avatar-badge">SO</div>
          <div className="avatar-details">
            <span className="avatar-name">Operator Console</span>
            <span className="avatar-role">Incident Responder</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

