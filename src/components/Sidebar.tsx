import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp, Home, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: 'home' | 'tier1' | 'tier2' | 'admin';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onNavigateToAdmin?: () => void;
}

export function Sidebar({ 
  currentView, 
  sidebarCollapsed, 
  toggleSidebar, 
  onNavigateHome, 
  onNavigateToTier,
  onNavigateToAdmin
}: SidebarProps) {
  const { state } = useAppContext();
  const redirectPathAfterLogin = state.redirectPathAfterLogin;
  const isAdmin = state.userData?.role === 'admin' || state.userData?.role === 'superAdmin';
  
  return (
    <aside className={`${sidebarCollapsed ? 'w-16 sm:w-24' : 'w-48 sm:w-64'} bg-white border-r border-gray-200 p-3 sm:p-6 transition-all duration-300 relative`}>
      {/* Navigation Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 sm:-right-4 top-6 sm:top-8 w-6 h-6 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
        ) : (
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
        )}
      </button>
      
      <nav className="space-y-2">
        <div 
          onClick={onNavigateHome}
          className={`flex items-center ${sidebarCollapsed ? 'justify-center w-8 h-8 sm:w-10 sm:h-10 p-0 mr-4 sm:mr-8' : 'space-x-2 sm:space-x-3 p-2 sm:p-3'} ${(currentView === 'home' && !redirectPathAfterLogin) ? 'text-white bg-primary' : 'text-secondary hover:bg-light'} rounded-lg cursor-pointer transition-colors duration-200`}
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Home</span>}
        </div>
        {!!state.loggedInUserDetails && <div 
          onClick={() => onNavigateToTier('tier1')}
          className={`flex items-center ${sidebarCollapsed ? 'justify-center w-8 h-8 sm:w-10 sm:h-10 p-0 mr-4 sm:mr-8' : 'space-x-2 sm:space-x-3 p-2 sm:p-3'} ${(currentView === 'tier1' || redirectPathAfterLogin?.includes('/tier1')) ? 'text-white bg-primary' : 'text-secondary hover:bg-light'} rounded-lg cursor-pointer transition-colors duration-200`}
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Tier 1 Assessment</span>}
        </div>}
        {!!state.loggedInUserDetails && <div 
          onClick={() => onNavigateToTier('tier2')}
          className={`flex items-center ${sidebarCollapsed ? 'justify-center w-8 h-8 sm:w-10 sm:h-10 p-0 mr-4 sm:mr-8' : 'space-x-2 sm:space-x-3 p-2 sm:p-3'} ${(currentView === 'tier2' || redirectPathAfterLogin?.includes('/tier2')) ? 'text-white bg-primary' : 'text-secondary hover:bg-light'} rounded-lg cursor-pointer transition-colors duration-200`}
        >
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Tier 2 Assessment</span>}
        </div>}
        {!!state.loggedInUserDetails && isAdmin && onNavigateToAdmin && <div 
          onClick={onNavigateToAdmin}
          className={`flex items-center ${sidebarCollapsed ? 'justify-center w-8 h-8 sm:w-10 sm:h-10 p-0 mr-4 sm:mr-8' : 'space-x-2 sm:space-x-3 p-2 sm:p-3'} ${(currentView === 'admin') ? 'text-white bg-primary' : 'text-secondary hover:bg-light'} rounded-lg cursor-pointer transition-colors duration-200`}
        >
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-sm sm:text-base">Admin Panel</span>}
        </div>}
      </nav>
    </aside>
  );
}