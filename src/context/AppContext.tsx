import { GetCurrentUserOutput } from "aws-amplify/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { LocalSchema } from "../amplifyClient";
import { Tier1ScoreResult } from "../utils/scoreCalculator";

export interface UserData {
  name: string;
  email: string;
  companyName: string;
  jobTitle: string;
}

export interface Tier2FormData {
  name: string;
  email: string;
  companyName: string;
  jobTitle: string;
  selectedDate: Date | null;
  selectedTimes: string[];
}

export type LOGIN_NEXT_STEP = "CONFIRM_SIGNUP" | "CONFIRM_SIGNIN";

export interface AppState {
  // User data
  userData: LocalSchema["User"]["type"] | null;
  userFormData: UserData | Tier2FormData | null;
  loginEmail: string;
  loggedInUserDetails: GetCurrentUserOutput | null;
  isLoadingInitialData: boolean;

  // Company data
  company: LocalSchema["Company"]["type"] | null;

  // Login next step
  loginNextStep: LOGIN_NEXT_STEP;

  // Assessment data
  tier1Score: Tier1ScoreResult | null;
  tier1Responses: Record<string, string>;

  // UI state
  sidebarCollapsed: boolean;

  // User loginflow
  loginFlow: "DIRECT" | "VIA_ASSESSMENT" | null;
  redirectPathAfterLogin?: string;
}

export type AppAction =
  | { type: "SET_USER_DATA"; payload: LocalSchema["User"]["type"] | null }
  | { type: "SET_COMPANY_DATA"; payload: LocalSchema["Company"]["type"] | null }
  | {
      type: "SET_USER_FORM_DATA";
      payload: UserData | null;
    }
  | { type: "SET_LOGIN_EMAIL"; payload: string }
  | { type: "SET_TIER1_SCORE"; payload: Tier1ScoreResult | null }
  | { type: "SET_TIER1_RESPONSES"; payload: Record<string, string> }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "LOGIN_NEXT_STEP"; payload: LOGIN_NEXT_STEP }
  | { type: "SET_LOGGED_IN_USER_DETAILS"; payload: GetCurrentUserOutput | null }
  | { type: "SET_LOGIN_FLOW"; payload: "DIRECT" | "VIA_ASSESSMENT" | null }
  | { type: "SET_REDIRECT_PATH_AFTER_LOGIN"; payload: string | undefined }
  | { type: "SET_IS_LOADING_INITIAL_DATA"; payload: boolean }
  | { type: "RESET_STATE" };

const initialState: AppState = {
  userData: null,
  company: null,
  userFormData: null,
  loginEmail: "",
  tier1Score: null,
  tier1Responses: {},
  sidebarCollapsed: true,
  loginNextStep: "CONFIRM_SIGNUP",
  loggedInUserDetails: null,
  loginFlow: null,
  redirectPathAfterLogin: undefined,
  isLoadingInitialData: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER_DATA":
      return { ...state, userData: action.payload };
    case "SET_COMPANY_DATA":
      return { ...state, company: action.payload };
    case "SET_USER_FORM_DATA":
      return { ...state, userFormData: action.payload };
    case "SET_LOGIN_EMAIL":
      return { ...state, loginEmail: action.payload };
    case "SET_TIER1_SCORE":
      return { ...state, tier1Score: action.payload };
    case "SET_TIER1_RESPONSES":
      return { ...state, tier1Responses: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "LOGIN_NEXT_STEP":
      return { ...state, loginNextStep: action.payload };
    case "SET_LOGGED_IN_USER_DETAILS":
      return { ...state, loggedInUserDetails: action.payload };
    case "SET_LOGIN_FLOW":
      return { ...state, loginFlow: action.payload };
    case "SET_REDIRECT_PATH_AFTER_LOGIN":
      return { ...state, redirectPathAfterLogin: action.payload };
    case "SET_IS_LOADING_INITIAL_DATA":
      return { ...state, isLoadingInitialData: action.payload };
    case "RESET_STATE":
      return { ...initialState };
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

  useEffect(() => {
    if (state.loggedInUserDetails) {
      // checkIfUserAlreadyLoggedIn();
    } else {
      dispatch({ type: "SET_USER_DATA", payload: null });
    }
  }, [state.loggedInUserDetails]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function useHasCompleteProfile(): boolean {
  const { state } = useAppContext();
  const { userData, company } = state;

  return Boolean(
    userData &&
      company &&
      userData.name &&
      userData.email &&
      userData.jobTitle &&
      company.name &&
      company.primaryDomain
  );
}

// Helper hook to check if user has Tier2 access
export function useHasTier2Access(): boolean {
  const { state } = useAppContext();
  
  if (!state.company?.config) return false;
  
  try {
    const config = JSON.parse(state.company.config as string);
    return config.tier2AccessEnabled === true;
  } catch {
    return false;
  }
}