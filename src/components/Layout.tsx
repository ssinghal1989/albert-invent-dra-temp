import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'tier1' | 'tier2' | 'admin' | 'explore-dimensions';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onNavigateToAdmin?: () => void;
  onNavigateToExploreDimensions?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export function Layout({
  children,
  currentView,
  sidebarCollapsed,
  toggleSidebar,
  onNavigateHome,
  onNavigateToTier,
  onNavigateToAdmin,
  onNavigateToExploreDimensions,
  onLogin,
  onLogout,
  userName
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="Albert Invent | Digital Readiness Assessment" 
        onLogin={onLogin}
        onLogout={onLogout}
        userName={userName}
        onToggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          currentView={currentView}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onNavigateHome={onNavigateHome}
          onNavigateToTier={onNavigateToTier}
          onNavigateToAdmin={onNavigateToAdmin}
          onNavigateToExploreDimensions={onNavigateToExploreDimensions}
        />
        <div className="flex-1 min-w-0 overflow-auto">
          {children}
        </div>
        
        {/* Mobile overlay when sidebar is open */}
        {!sidebarCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}