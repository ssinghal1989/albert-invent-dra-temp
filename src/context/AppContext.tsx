import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UserData {
  name: string;
  email: string;
  companyName: string;
  jobTitle: string;
}

export interface AppState {
  // User data
  userData: UserData | null;
  pendingUserData: UserData | null;
  loginEmail: string;
  
  // Assessment data
  tier1Score: number;
  tier1Responses: Record<string, string>;
  intermediateResponses: Record<string, string>;
  previousAssessments: any[];
  
  // UI state
  sidebarCollapsed: boolean;
}

export type AppAction =
  | { type: 'SET_USER_DATA'; payload: UserData | null }
  | { type: 'SET_PENDING_USER_DATA'; payload: UserData | null }
  | { type: 'SET_LOGIN_EMAIL'; payload: string }
  | { type: 'SET_TIER1_SCORE'; payload: number }
  | { type: 'SET_TIER1_RESPONSES'; payload: Record<string, string> }
  | { type: 'SET_INTERMEDIATE_RESPONSES'; payload: Record<string, string> }
  | { type: 'CLEAR_INTERMEDIATE_RESPONSES' }
  | { type: 'SET_PREVIOUS_ASSESSMENTS'; payload: any[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  userData: null,
  pendingUserData: null,
  loginEmail: '',
  tier1Score: 78,
  tier1Responses: {},
  intermediateResponses: {},
  previousAssessments: [],
  sidebarCollapsed: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload };
    case 'SET_PENDING_USER_DATA':
      return { ...state, pendingUserData: action.payload };
    case 'SET_LOGIN_EMAIL':
      return { ...state, loginEmail: action.payload };
    case 'SET_TIER1_SCORE':
      return { ...state, tier1Score: action.payload };
    case 'SET_TIER1_RESPONSES':
      return { ...state, tier1Responses: action.payload };
    case 'SET_INTERMEDIATE_RESPONSES':
      return { ...state, intermediateResponses: action.payload };
    case 'CLEAR_INTERMEDIATE_RESPONSES':
      return { ...state, intermediateResponses: {} };
    case 'SET_PREVIOUS_ASSESSMENTS':
      return { ...state, previousAssessments: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'RESET_STATE':
      return { ...initialState, intermediateResponses: {} };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}