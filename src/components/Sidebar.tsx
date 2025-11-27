import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp, Home, Shield, X, Layers, ChevronDown } from 'lucide-react';
import { useAppContext, useHasTier2Access } from '../context/AppContext';

interface SidebarProps {
  currentView: 'home' | 'tier1' | 'tier2' | 'admin' | 'explore-dimensions';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onNavigateHome: () => void;
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onNavigateToAdmin?: () => void;
  onNavigateToExploreDimensions?: () => void;
}

export function Sidebar({
  currentView,
  sidebarCollapsed,
  toggleSidebar,
  onNavigateHome,
  onNavigateToTier,
  onNavigateToAdmin,
  onNavigateToExploreDimensions
}: SidebarProps) {
  const { state } = useAppContext();
  const redirectPathAfterLogin = state.redirectPathAfterLogin;
  const isAdmin = state.userData?.role === 'admin' || state.userData?.role === 'superAdmin';
  const hasTier2Access = useHasTier2Access();
  const [tier2Expanded, setTier2Expanded] = useState(false);
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex lg:flex-col
        ${sidebarCollapsed ? 'lg:w-16 xl:w-20' : 'lg:w-64 xl:w-72'}
        bg-white border-r border-gray-200 transition-all duration-300
        relative
      `}>
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Desktop Navigation Toggle */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 w-8 h-8 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center z-50"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-black" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-black" />
            )}
          </button>
          
          <nav className="space-y-2 mt-4">
            <div 
              onClick={onNavigateHome}
              className={`flex items-center ${
                sidebarCollapsed 
                  ? 'justify-center w-10 h-10 p-0' 
                  : 'space-x-3 p-3 w-full'
              } ${
                (currentView === 'home' && !redirectPathAfterLogin) 
                  ? 'text-white bg-primary' 
                  : 'text-secondary hover:bg-light'
              } rounded-lg cursor-pointer transition-colors duration-200`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-base">Home</span>}
            </div>
            {!!state.loggedInUserDetails && <div 
              onClick={() => onNavigateToTier('tier1')}
              className={`flex items-center ${
                sidebarCollapsed 
                  ? 'justify-center w-10 h-10 p-0' 
                  : 'space-x-3 p-3 w-full'
              } ${
                (currentView === 'tier1' || redirectPathAfterLogin?.includes('/tier1')) 
                  ? 'text-white bg-primary' 
                  : 'text-secondary hover:bg-light'
              } rounded-lg cursor-pointer transition-colors duration-200`}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-base">Tier 1 Assessment</span>}
            </div>}
            {!!state.loggedInUserDetails && (
              <div className="relative">
                {sidebarCollapsed ? (
                  <>
                    <div
                      onClick={() => onNavigateToTier('tier2')}
                      className={`flex items-center justify-center w-10 h-10 ${
                        currentView === 'tier2'
                          ? 'text-white bg-primary'
                          : 'text-secondary hover:bg-light'
                      } rounded-lg cursor-pointer transition-colors duration-200`}
                    >
                      <TrendingUp className="w-5 h-5 flex-shrink-0" />
                    </div>
                    {hasTier2Access && onNavigateToExploreDimensions && (
                      <div
                        onClick={onNavigateToExploreDimensions}
                        className={`flex items-center justify-center w-10 h-10 mt-1 ${
                          currentView === 'explore-dimensions'
                            ? 'text-white bg-primary'
                            : 'text-secondary hover:bg-light'
                        } rounded-lg cursor-pointer transition-colors duration-200`}
                      >
                        <Layers className="w-4 h-4 flex-shrink-0" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={`flex items-center justify-between p-3 w-full ${
                        (currentView === 'tier2' || currentView === 'explore-dimensions' || redirectPathAfterLogin?.includes('/tier2'))
                          ? 'text-secondary hover:bg-light'
                          : 'text-secondary hover:bg-light'
                      } rounded-lg cursor-pointer transition-colors duration-200`}
                    >
                      <div
                        onClick={() => onNavigateToTier('tier2')}
                        className="flex items-center space-x-3 flex-1"
                      >
                        <TrendingUp className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-base">Tier 2 Assessment</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTier2Expanded(!tier2Expanded);
                        }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          tier2Expanded ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                    {tier2Expanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        <div
                          onClick={() => onNavigateToTier('tier2')}
                          className={`flex items-center space-x-3 p-3 w-full ${
                            currentView === 'tier2'
                              ? 'text-white bg-primary'
                              : 'text-secondary hover:bg-light'
                          } rounded-lg cursor-pointer transition-colors duration-200`}
                        >
                          <TrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-sm">Take Assessment</span>
                        </div>
                        {hasTier2Access && onNavigateToExploreDimensions && (
                          <div
                            onClick={onNavigateToExploreDimensions}
                            className={`flex items-center space-x-3 p-3 w-full ${
                              currentView === 'explore-dimensions'
                                ? 'text-white bg-primary'
                                : 'text-secondary hover:bg-light'
                            } rounded-lg cursor-pointer transition-colors duration-200`}
                          >
                            <Layers className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm">Explore Dimensions</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {!!state.loggedInUserDetails && isAdmin && onNavigateToAdmin && <div 
              onClick={onNavigateToAdmin}
              className={`flex items-center ${
                sidebarCollapsed 
                  ? 'justify-center w-10 h-10 p-0' 
                  : 'space-x-3 p-3 w-full'
              } ${
                (currentView === 'admin') 
                  ? 'text-white bg-primary' 
                  : 'text-secondary hover:bg-light'
              } rounded-lg cursor-pointer transition-colors duration-200`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-base">Admin Panel</span>}
            </div>}
          </nav>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              <div 
                onClick={() => {
                  onNavigateHome();
                  toggleSidebar();
                }}
                className={`flex items-center space-x-3 p-4 w-full ${
                  (currentView === 'home' && !redirectPathAfterLogin) 
                    ? 'text-white bg-primary' 
                    : 'text-secondary hover:bg-light'
                } rounded-lg cursor-pointer transition-colors duration-200`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-base">Home</span>
              </div>
              {!!state.loggedInUserDetails && <div 
                onClick={() => {
                  onNavigateToTier('tier1');
                  toggleSidebar();
                }}
                className={`flex items-center space-x-3 p-4 w-full ${
                  (currentView === 'tier1' || redirectPathAfterLogin?.includes('/tier1')) 
                    ? 'text-white bg-primary' 
                    : 'text-secondary hover:bg-light'
                } rounded-lg cursor-pointer transition-colors duration-200`}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-base">Tier 1 Assessment</span>
              </div>}
              {!!state.loggedInUserDetails && (
                <div>
                  <div
                    className={`flex items-center justify-between p-4 w-full ${
                      (currentView === 'tier2' || currentView === 'explore-dimensions' || redirectPathAfterLogin?.includes('/tier2'))
                        ? 'text-secondary hover:bg-light'
                        : 'text-secondary hover:bg-light'
                    } rounded-lg cursor-pointer transition-colors duration-200`}
                  >
                    <div
                      onClick={() => {
                        onNavigateToTier('tier2');
                        toggleSidebar();
                      }}
                      className="flex items-center space-x-3 flex-1"
                    >
                      <TrendingUp className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-base">Tier 2 Assessment</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTier2Expanded(!tier2Expanded);
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        tier2Expanded ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                  {tier2Expanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      <div
                        onClick={() => {
                          onNavigateToTier('tier2');
                          toggleSidebar();
                        }}
                        className={`flex items-center space-x-3 p-4 w-full ${
                          currentView === 'tier2'
                            ? 'text-white bg-primary'
                            : 'text-secondary hover:bg-light'
                        } rounded-lg cursor-pointer transition-colors duration-200`}
                      >
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">Take Assessment</span>
                      </div>
                      {hasTier2Access && onNavigateToExploreDimensions && (
                        <div
                          onClick={() => {
                            onNavigateToExploreDimensions();
                            toggleSidebar();
                          }}
                          className={`flex items-center space-x-3 p-4 w-full ${
                            currentView === 'explore-dimensions'
                              ? 'text-white bg-primary'
                              : 'text-secondary hover:bg-light'
                          } rounded-lg cursor-pointer transition-colors duration-200`}
                        >
                          <Layers className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-sm">Explore Dimensions</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!!state.loggedInUserDetails && isAdmin && onNavigateToAdmin && <div 
                onClick={() => {
                  onNavigateToAdmin();
                  toggleSidebar();
                }}
                className={`flex items-center space-x-3 p-4 w-full ${
                  (currentView === 'admin') 
                    ? 'text-white bg-primary' 
                    : 'text-secondary hover:bg-light'
                } rounded-lg cursor-pointer transition-colors duration-200`}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-base">Admin Panel</span>
              </div>}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}