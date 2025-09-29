import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext, useHasCompleteProfile } from '../context/AppContext';
import { Loader } from './ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCompleteProfile?: boolean;
  requireTier1Completion?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireCompleteProfile = false,
  requireTier1Completion = false,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { state } = useAppContext();
  const hasCompleteProfile = useHasCompleteProfile();
  const location = useLocation();

  // Show loading while checking authentication status
  if (state.isLoadingInitialData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader text="Checking authentication..." size="lg" />
      </div>
    );
  }

  // Check if user authentication is required
  if (requireAuth && !state.loggedInUserDetails) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if complete profile is required
  if (requireCompleteProfile && !hasCompleteProfile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if Tier 1 completion is required
  if (requireTier1Completion && !state.tier1Score) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // All conditions met, render the protected content
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protectionConfig: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...protectionConfig}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific protected route components for common use cases
export function AuthProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/email-login">
      {children}
    </ProtectedRoute>
  );
}

export function ProfileProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requireCompleteProfile={true} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}

export function Tier1ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      requireCompleteProfile={true} 
      requireTier1Completion={true} 
      redirectTo="/tier1"
    >
      {children}
    </ProtectedRoute>
  );
}