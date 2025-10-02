import React from "react";
import { LogOut, LogIn, Menu } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { LoadingButton } from "./ui/LoadingButton";

interface HeaderProps {
  title: string;
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, onLogin, onLogout, userName, onToggleSidebar }: HeaderProps) {
  const { state } = useAppContext();
  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-black truncate">
            <span className="hidden sm:inline">{title}</span>
            <span className="sm:hidden">Albert Invent</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {(!userName || state.isLoadingInitialData) && onLogin && (
            <LoadingButton
              disabled={state.isLoadingInitialData}
              loadingText="Loading ..."
              loading={state.isLoadingInitialData}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              onClick={onLogin}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </div>
            </LoadingButton>
          )}
          {userName && !state.isLoadingInitialData && onLogout && (
            <>
              <span className="text-secondary font-medium hidden md:inline text-sm">
                Welcome, {userName}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-secondary hover:text-gray-800 px-2 sm:px-3 py-2 rounded-lg hover:bg-light transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
