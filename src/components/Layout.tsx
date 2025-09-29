import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'tier1' | 'tier2';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
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
      />
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar
          currentView={currentView}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onNavigateHome={onNavigateHome}
          onNavigateToTier={onNavigateToTier}
        />
        {children}
      </div>
    </div>
  );
}