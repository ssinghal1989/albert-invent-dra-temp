import { useState, useEffect } from 'react';
import { authService } from '../services/amplifyService';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export function useAmplifyAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setAuthState({
          user: result.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to check authentication state',
      });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authService.signUp(email, password, name);
    
    if (result.success) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to sign up' 
      }));
      return { success: false, error: result.error };
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authService.confirmSignUp(email, code);
    
    if (result.success) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to confirm sign up' 
      }));
      return { success: false, error: result.error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await authService.signIn(email, password);
    
    if (result.success) {
      setAuthState({
        user: result.user,
        loading: false,
        error: null,
      });
      return { success: true };
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to sign in' 
      }));
      return { success: false, error: result.error };
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    const result = await authService.signOut();
    
    if (result.success) {
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to sign out' 
      }));
      return { success: false, error: result.error };
    }
  };

  return {
    ...authState,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    checkAuthState,
  };
}