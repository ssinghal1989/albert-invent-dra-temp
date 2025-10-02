import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useAuthFlow } from '../../../hooks/useAuthFlow';
import { useAssessment } from '../../../hooks/useAssesment';
import { UserData, LOGIN_NEXT_STEP, useAppContext } from '../../../context/AppContext';
import { getDomainFromEmail } from '../../../utils/common';
import { ifDomainAlloeded } from '../../../utils/domain';
import { LocalSchema } from '../../../amplifyClient';

export function useSignupFlow() {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showSignupOtp, setShowSignupOtp] = useState(false);
  const [signupFormData, setSignupFormData] = useState<UserData | null>(null);
  const [pendingSignupEmail, setPendingSignupEmail] = useState<string | null>(null);
  
  const { showToast } = useToast();
  const { dispatch } = useAppContext();
  const { fetchUserAssessments } = useAssessment();

  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    if (signupFormData) {
      dispatch({ type: "LOGIN_NEXT_STEP", payload: nextStep });
      dispatch({ type: "SET_LOGIN_EMAIL", payload: signupFormData.email });
      setShowSignupForm(false);
      setShowSignupOtp(true);
    }
  };

  const { handleAuth } = useAuthFlow(updateStateAndNavigateToOtp);

  // Handle auth flow after signupFormData is set
  useEffect(() => {
    if (signupFormData && pendingSignupEmail) {
      const triggerAuth = async () => {
        try {
          await handleAuth(pendingSignupEmail);
          setPendingSignupEmail(null);
        } catch (error) {
          console.error("Error in signup auth flow:", error);
          setPendingSignupEmail(null);
        }
      };
      triggerAuth();
    }
  }, [signupFormData, pendingSignupEmail, handleAuth]);

  const handleSignupFormSubmit = async (userData: UserData) => {
    try {
      // Validate email domain
      if (!ifDomainAlloeded(getDomainFromEmail(userData.email)!)) {
        showToast({
          type: "error",
          title: "Invalid Email",
          message: "Please use your work email address",
          duration: 5000,
        });
        return;
      }

      // Store the form data for later use
      setSignupFormData(userData);
      
      // Set pending email to trigger auth flow via useEffect
      setPendingSignupEmail(userData.email);
      
    } catch (error) {
      console.error("Error during signup form submission:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to process your request. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleSignupOtpVerification = async (data: {
    user?: LocalSchema["User"]["type"];
    company?: LocalSchema["Company"]["type"];
  }) => {
    try {
      if (!signupFormData) {
        showToast({
          type: "error",
          title: "Error",
          message: "Signup data is missing. Please try again.",
          duration: 5000,
        });
        return;
      }

      const { user, company } = data;
      
      if (!user || !company) {
        showToast({
          type: "error",
          title: "Error",
          message: "Account creation failed. Please try again.",
          duration: 5000,
        });
        return;
      }

      // Close the OTP modal and cleanup
      setShowSignupOtp(false);
      setSignupFormData(null);
      setPendingSignupEmail(null);

      // Show success message
      showToast({
        type: "success",
        title: "Account Created!",
        message: "Your account has been created successfully and your results have been saved!",
        duration: 6000,
      });
      
      // Refresh assessments to show the linked data
      await fetchUserAssessments();
      
    } catch (error) {
      console.error("Error in signup OTP verification:", error);
      setShowSignupOtp(false);
      setSignupFormData(null);
      setPendingSignupEmail(null);
      
      showToast({
        type: "error",
        title: "Error",
        message: "There was an issue creating your account. Please try again.",
        duration: 6000,
      });
    }
  };

  const handleSignUpToSave = () => {
    setShowSignupForm(true);
  };

  const handleCancelSignupForm = () => {
    setShowSignupForm(false);
  };

  const handleCancelSignupOtp = () => {
    setShowSignupOtp(false);
    setSignupFormData(null);
    setShowSignupForm(true); // Go back to signup form
  };

  return {
    showSignupForm,
    showSignupOtp,
    signupFormData,
    handleSignupFormSubmit,
    handleSignupOtpVerification,
    handleSignUpToSave,
    handleCancelSignupForm,
    handleCancelSignupOtp
  };
}