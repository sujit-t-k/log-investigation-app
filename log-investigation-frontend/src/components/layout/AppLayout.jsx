import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [refreshHandler, setRefreshHandler] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (typeof refreshHandler === 'function') {
      try {
        setIsRefreshing(true);
        await refreshHandler();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className={`app-shell ${isCollapsed ? 'shell-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="app-main-wrapper">
        <Topbar
          onOpenMobile={() => setIsMobileOpen(true)}
          onRefresh={refreshHandler ? handleRefresh : null}
          isRefreshing={isRefreshing}
        />

        <main className="app-content-area" id="main-content">
          <Outlet context={{ setRefreshHandler, isRefreshing, triggerRefresh: handleRefresh }} />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

