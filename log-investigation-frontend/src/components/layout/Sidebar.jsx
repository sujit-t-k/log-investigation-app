import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/logs',
      label: 'Log Explorer',
      icon: FileText,
      badge: null,
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Application Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Activity size={22} />
          </div>
          {!isCollapsed && (
            <div className="brand-info">
              <span className="brand-title">LogPulse</span>
              <span className="brand-subtitle">Ops & Incident Platform</span>
            </div>
          )}
          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {!isCollapsed ? 'OPERATIONS' : '•••'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={19} />
                </div>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span style={{ fontSize: '0.8125rem' }}>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

