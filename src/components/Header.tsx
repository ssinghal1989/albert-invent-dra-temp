import React from 'react';
import { LogOut, LogIn } from 'lucide-react';

interface HeaderProps {
  title: string;
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export function Header({ title, onLogin, onLogout, userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">
          {title}
        </h1>
        <div className="flex items-center space-x-4">
          {!userName && onLogin && (
            <button 
              onClick={onLogin}
              className="flex items-center space-x-2 text-secondary hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-light transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
          {userName && onLogout && (
            <>
              <span className="text-secondary font-medium">
                Welcome, {userName}
              </span>
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 text-secondary hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-light transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}