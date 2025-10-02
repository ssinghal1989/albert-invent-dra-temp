import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'tier1' | 'tier2' | 'admin';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onNavigateToAdmin?: () => void;
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
  onLogin,
  onLogout,
  userName
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Albert Invent | Digital Readiness Assessment" 
        onLogin={onLogin}
        onLogout={onLogout}
        userName={userName}
        onToggleSidebar={toggleSidebar}
      />
      <div className="flex min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-72px)] lg:min-h-[calc(100vh-80px)] relative">
        <Sidebar
          currentView={currentView}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onNavigateHome={onNavigateHome}
          onNavigateToTier={onNavigateToTier}
          onNavigateToAdmin={onNavigateToAdmin}
        />
        <div className={`flex-1 min-w-0 transition-all duration-300 ${
          !sidebarCollapsed ? 'lg:ml-0' : ''
        }`}>
          {children}
        </div>
        
        {/* Mobile overlay when sidebar is open */}
        {!sidebarCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}