import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { client, LocalSchema } from "./amplifyClient";
import { EmailLoginModal } from "./components/EmailLoginModal";
import { HomePage } from "./components/HomePage";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { OtpVerificationPage } from "./components/OtpVerificationPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Tier1Assessment } from "./components/Tier1Assessment";
import { Tier1Results } from "./components/Tier1Results";
import { AdminPanel } from "./components/AdminPanel";
import {
  AppProvider,
  Tier2FormData,
  useAppContext,
  useHasCompleteProfile,
  UserData,
} from "./context/AppContext";
import { useSetUserData } from "./hooks/setUserData";
import { useAssessment } from "./hooks/useAssesment";
import { seedDataService } from "./services/seedDataService";
import { calculateTier1Score } from "./utils/scoreCalculator";
import { ToastProvider, useToast } from "./context/ToastContext";
import { useCallRequest } from "./hooks/useCallRequest";
import { Tier2AssessmentOld } from "./components/Tier2AssessmentOld";

function AppContent() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCompleteProfile = useHasCompleteProfile();
  const { setUserData } = useSetUserData();
  const { submitTier1Assessment, fetchUserAssessments } = useAssessment();
  const { scheduleRequest, fetchUserCallRequests } = useCallRequest();
  const { showToast } = useToast();

  const checkIfUserAlreadyLoggedIn = async () => {
    try {
      dispatch({ type: "SET_IS_LOADING_INITIAL_DATA", payload: true });
      const currentUser = await getCurrentUser();
      if (currentUser) {
        dispatch({ type: "SET_LOGGED_IN_USER_DETAILS", payload: currentUser });
        setUserData({ loggedInUserDetails: currentUser! });
      }
      dispatch({ type: "SET_IS_LOADING_INITIAL_DATA", payload: false });
    } catch (error) {
      dispatch({ type: "SET_IS_LOADING_INITIAL_DATA", payload: false });
      console.error("Error checking if user is logged in:", error);
    }
  };

  const checkAndSetupQuestions = async () => {
    await seedDataService.initializeDefaultQuestions();
  };

  const updateUserRole = async () => {
    if (state?.userData?.id) {
      await client.models.User.update({
        id: state.userData.id,
        role: 'admin',
      })
    }
  }

  useEffect(() => {
    checkIfUserAlreadyLoggedIn();
    // checkAndSetupQuestions();
    // updateUserRole();
  }, []);

  const getCurrentView = (): "home" | "tier1" | "tier2" | "admin" => {
    const path = location.pathname;
    if (path === "/tier1") return "tier1";
    if (path === "/tier2") return "tier2";
    if (path === "/admin") return "admin";
    return "home";
  };

  const navigateToTier = (tier: "tier1" | "tier2") => {
    navigate(`/${tier}`);
  };

  const navigateHome = () => {
    navigate("/");
  };

  const navigateToAdmin = () => {
    navigate("/admin");
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const handleLogin = (data: UserData) => {
    navigate("/otp");
  };

  const handleOtpVerification = () => {
    dispatch({ type: "SET_LOGIN_EMAIL", payload: "" });
    if (state.redirectPathAfterLogin?.includes("tier1")) {
      // Handle to redirect on result page
      navigate("/tier1-results");
    } else if (state.redirectPathAfterLogin?.includes("tier2")) {
      // Handle to redirect on result page
      navigate("/tier2");
    } else {
      navigate("/");
    }
    dispatch({ type: "SET_REDIRECT_PATH_AFTER_LOGIN", payload: undefined });
  };

  const handleLogout = async () => {
    await signOut();
    dispatch({ type: "RESET_STATE" });
    navigate("/");
  };

  const handleHeaderLogin = () => {
    // get the current path to redirect after login
    dispatch({
      type: "SET_REDIRECT_PATH_AFTER_LOGIN",
      payload: location.pathname,
    });
    navigate("/email-login");
  };

  const handleLoginOtpVerification = async (data: {
    user?: LocalSchema["User"]["type"];
    company?: LocalSchema["Company"]["type"];
  }) => {
    const { user, company } = data;
    dispatch({ type: "SET_LOGIN_EMAIL", payload: "" });
    if (state.redirectPathAfterLogin?.includes("tier1-results")) {
      await submitTier1Assessment(data);
      await fetchUserAssessments();
      navigate(state.redirectPathAfterLogin || "/");
      dispatch({ type: "SET_REDIRECT_PATH_AFTER_LOGIN", payload: undefined });
    }
    if (state.redirectPathAfterLogin?.includes("tier2")) {
      try {
        const tier2FormData = state.userFormData as Tier2FormData;
        const { data } = await scheduleRequest({
          preferredDate: new Date(tier2FormData?.selectedDate!)
            .toISOString()
            .split("T")[0]!,
          preferredTimes: tier2FormData?.selectedTimes,
          initiatorUserId: user?.id,
          companyId: company?.id,
          status: "PENDING",
          type: "TIER2_REQUEST",
          metadata: JSON.stringify({
            userEmail: tier2FormData?.email!,
            userName: tier2FormData?.name!,
            companyDomain: company?.primaryDomain!,
            companyName: tier2FormData?.companyName!,
            userJobTitle: tier2FormData?.jobTitle!,
          }),
        });
        if (data) {
          fetchUserCallRequests();
          navigate(state.redirectPathAfterLogin || "/");
          dispatch({
            type: "SET_REDIRECT_PATH_AFTER_LOGIN",
            payload: undefined,
          });
          //setCurrentStep("confirmation");
        } else {
          showToast({
            type: "error",
            title: "Request Failed",
            message: "Failed to schedule the call. Please try again.",
            duration: 5000,
          });
        }
      } catch (err) {
        showToast({
          type: "error",
          title: "Request Failed",
          message: "Failed to schedule the call. Please try again.",
          duration: 5000,
        });
      }
    } else {
      navigate(state.redirectPathAfterLogin || "/");
      dispatch({ type: "SET_REDIRECT_PATH_AFTER_LOGIN", payload: undefined });
    }
    // Handle tier2 assessment request
  };

  const handleRetakeAssessment = () => {
    navigate("/tier1");
  };

  const handleTier1Complete = async (
    responses: Record<string, string>,
    questions: any[]
  ) => {
    const score = calculateTier1Score(responses, questions);
    dispatch({ type: "SET_TIER1_RESPONSES", payload: responses });
    dispatch({
      type: "SET_TIER1_SCORE",
      payload: score,
    });
    if (hasCompleteProfile) {
      await submitTier1Assessment({
        tier1Score: score,
        tier1Responses: responses,
      });
      await fetchUserAssessments();
      navigate("/tier1-results");
    } else {
      dispatch({
        type: "SET_REDIRECT_PATH_AFTER_LOGIN",
        payload: "/tier1-results",
      });
      navigate("/login");
    }
  };

  return (
    <Layout
      currentView={getCurrentView()}
      sidebarCollapsed={state.sidebarCollapsed}
      toggleSidebar={toggleSidebar}
      onNavigateHome={navigateHome}
      onNavigateToTier={navigateToTier}
      onNavigateToAdmin={navigateToAdmin}
      onLogin={handleHeaderLogin}
      onLogout={handleLogout}
      userName={state.userData?.name || state.userData?.email || ""}
    >
      <Routes>
        <Route
          path="/"
          element={<HomePage onNavigateToTier={navigateToTier} />}
        />
        <Route
          path="/tier1"
          element={<Tier1Assessment onComplete={handleTier1Complete} />}
        />
        <Route
          path="/tier2"
          element={
            // <Tier2Assessment
            //   onNavigateToTier={navigateToTier}
            // />
            <Tier2AssessmentOld />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth={true} redirectTo="/">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage onLogin={handleLogin} onCancel={() => navigate("/")} />
          }
        />
        <Route
          path="/otp"
          element={
            <OtpVerificationPage
              userEmail={state.loginEmail}
              onVerify={handleOtpVerification}
              onCancel={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/tier1-results"
          element={
            state.tier1Score ? (
              <ProtectedRoute requireAuth={true} redirectTo="/">
                <Tier1Results
                  score={state.tier1Score}
                  onNavigateToTier2={() => navigate("/tier2")}
                  onRetakeAssessment={handleRetakeAssessment}
                />
              </ProtectedRoute>
            ) : // <Navigate to={"/"} state={{ from: location }} replace />
            null
          }
        />
        <Route
          path="/email-login"
          element={
            <EmailLoginModal
              onCancel={() => {
                navigate(`${state.redirectPathAfterLogin}` || "/");
                dispatch({
                  type: "SET_REDIRECT_PATH_AFTER_LOGIN",
                  payload: undefined,
                });
              }}
            />
          }
        />
        {/* OTP verification route for direct login flow */}
        <Route
          path="/otp-login"
          element={
            <OtpVerificationPage
              userEmail={state.loginEmail}
              onVerify={handleLoginOtpVerification}
              onCancel={() => navigate("/email-login")}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
