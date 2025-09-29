import React from "react";
import { LogOut, LogIn } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { LoadingButton } from "./ui/LoadingButton";

interface HeaderProps {
  title: string;
  onLogin?: () => void;
  onLogout?: () => void;
  userName?: string;
}

export function Header({ title, onLogin, onLogout, userName }: HeaderProps) {
  const { state } = useAppContext();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">{title}</h1>
        <div className="flex items-center space-x-4">
          {(!userName || state.isLoadingInitialData) && onLogin && (
            <LoadingButton
              disabled={state.isLoadingInitialData}
              loadingText="Loading ..."
              loading={state.isLoadingInitialData}
              style={{ width: "100%" }}
              onClick={onLogin}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  width: "100%",
                }}
              >
                Login
              </div>
            </LoadingButton>
            // <button
            //   disabled={state.isLoadingInitialData}
            //   onClick={onLogin}
            //   className="flex items-center space-x-2 text-secondary hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-light transition-all duration-200"
            // >
            //   <LogIn className="w-4 h-4" />
            //   <span>Login</span>
            // </button>
          )}
          {userName && !state.isLoadingInitialData && onLogout && (
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
