import { useState, useEffect } from "react";
import { useToast } from "../../../context/ToastContext";
import { useAuthFlow } from "../../../hooks/useAuthFlow";
import { useCallRequest } from "../../../hooks/useCallRequest";
import { useAssessment } from "../../../hooks/useAssesment";
import { LOGIN_NEXT_STEP, useAppContext } from "../../../context/AppContext";
import { CombinedScheduleData } from "../../ui/CombinedScheduleForm";
import { getDomainFromEmail } from "../../../utils/common";
import { ifDomainAlloeded } from "../../../utils/domain";
import { LocalSchema } from "../../../amplifyClient";

export function useCombinedScheduleFlow(score: any) {
  console.log("🔄 [useCombinedScheduleFlow] Hook initialized", { score: score?.overallScore });
  
  const [showCombinedForm, setShowCombinedForm] = useState(false);
  const [showCombinedOtp, setShowCombinedOtp] = useState(false);
  const [combinedFormData, setCombinedFormData] = useState<CombinedScheduleData | null>(null);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

  // Log state changes
  useEffect(() => {
    console.log("📊 [useCombinedScheduleFlow] State changed:", {
      showCombinedForm,
      showCombinedOtp,
      hasCombinedFormData: !!combinedFormData,
      isAuthInProgress
    });
  }, [showCombinedForm, showCombinedOtp, combinedFormData, isAuthInProgress]);

  const { showToast } = useToast();
  const { state, dispatch } = useAppContext();
  const { scheduleRequest } = useCallRequest();
  const { 
    userTier1Assessments, 
    linkAnonymousAssessment, 
    findAndLinkAnonymousAssessments 
  } = useAssessment();

  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    console.log("🔐 [updateStateAndNavigateToOtp] Called with nextStep:", nextStep);
    console.log("📋 [updateStateAndNavigateToOtp] Current form data:", combinedFormData);
    
    dispatch({ type: "LOGIN_NEXT_STEP", payload: nextStep });
    console.log("✅ [updateStateAndNavigateToOtp] Dispatched LOGIN_NEXT_STEP");
    
    // Set OTP screen to show and hide form
    setTimeout(() => {
      console.log("⏰ [updateStateAndNavigateToOtp] Timeout executing - updating UI state");
      setShowCombinedForm(false);
      console.log("❌ [updateStateAndNavigateToOtp] Set showCombinedForm to false");
      setShowCombinedOtp(true);
      console.log("✅ [updateStateAndNavigateToOtp] Set showCombinedOtp to true");
      setIsAuthInProgress(false);
      console.log("🔄 [updateStateAndNavigateToOtp] Set isAuthInProgress to false");
    }, 100);
  };

  const { handleAuth } = useAuthFlow(updateStateAndNavigateToOtp);

  const handleCombinedFormSubmit = async (data: CombinedScheduleData) => {
    console.log("📝 [handleCombinedFormSubmit] Starting form submission", {
      email: data.email,
      name: data.name,
      selectedDate: data.selectedDate,
      selectedTimesCount: data.selectedTimes.length,
      isAuthInProgress
    });
    
    try {
      // Prevent multiple submissions
      if (isAuthInProgress) {
        console.log("⚠️ [handleCombinedFormSubmit] Auth already in progress, skipping...");
        return;
      }

      // Validate email domain
      console.log("🔍 [handleCombinedFormSubmit] Validating email domain for:", data.email);
      if (!ifDomainAlloeded(getDomainFromEmail(data.email)!)) {
        console.log("❌ [handleCombinedFormSubmit] Email domain not allowed:", getDomainFromEmail(data.email));
        showToast({
          type: "error",
          title: "Invalid Email",
          message: "Please use your work email address",
          duration: 5000,
        });
        return;
      }
      console.log("✅ [handleCombinedFormSubmit] Email domain validation passed");

      // Store the form data for later use
      console.log("💾 [handleCombinedFormSubmit] Storing form data");
      setCombinedFormData(data);

      // Trigger auth flow directly
      console.log("🚀 [handleCombinedFormSubmit] Starting auth flow");
      setIsAuthInProgress(true);
      console.log("🔄 [handleCombinedFormSubmit] Set isAuthInProgress to true");
      
      try {
        dispatch({ type: "SET_LOGIN_EMAIL", payload: data.email });
        console.log("📧 [handleCombinedFormSubmit] Dispatched SET_LOGIN_EMAIL:", data.email);
        console.log("🔐 [handleCombinedFormSubmit] Calling handleAuth...");
        await handleAuth(data.email);
        console.log("✅ [handleCombinedFormSubmit] handleAuth completed successfully");
      } catch (error) {
        console.error("❌ [handleCombinedFormSubmit] Error in auth flow:", error);
        setIsAuthInProgress(false);
        setCombinedFormData(null);
        console.log("🔄 [handleCombinedFormSubmit] Reset state due to auth error");
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Failed to send verification code. Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("❌ [handleCombinedFormSubmit] Error during combined form submission:", error);
      setIsAuthInProgress(false);
      setCombinedFormData(null);
      console.log("🔄 [handleCombinedFormSubmit] Reset state due to outer error");
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to process your request. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleCombinedOtpVerification = async (data: {
    user?: LocalSchema["User"]["type"];
    company?: LocalSchema["Company"]["type"];
  }) => {
    console.log("🔐 [handleCombinedOtpVerification] Starting OTP verification", {
      hasUser: !!data.user,
      hasCompany: !!data.company,
      hasCombinedFormData: !!combinedFormData
    });
    
    try {
      if (!combinedFormData) {
        console.log("❌ [handleCombinedOtpVerification] No combined form data available");
        showToast({
          type: "error",
          title: "Error",
          message: "Form data is missing. Please try again.",
          duration: 5000,
        });
        return;
      }

      const { user, company } = data;

      if (!user || !company) {
        console.log("❌ [handleCombinedOtpVerification] Missing user or company data", {
          hasUser: !!user,
          hasCompany: !!company
        });
        showToast({
          type: "error",
          title: "Error",
          message: "User verification failed. Please try again.",
          duration: 5000,
        });
        return;
      }

      // CRITICAL: Link the current anonymous assessment with the new user
      console.log("🔗 [handleCombinedOtpVerification] Attempting to link anonymous assessment", {
        userId: user.id,
        companyId: company.id,
        hasAnonymousAssessmentId: !!state.anonymousAssessmentId
      });
      
      let linkedAssessmentId = null;
      
      if (state.anonymousAssessmentId) {
        console.log("📋 [handleCombinedOtpVerification] Linking specific anonymous assessment:", state.anonymousAssessmentId);
        try {
          const linkedAssessment = await linkAnonymousAssessment(
            state.anonymousAssessmentId,
            user.id,
            company.id
          );
          linkedAssessmentId = linkedAssessment?.id;
          console.log("✅ [handleCombinedOtpVerification] Successfully linked anonymous assessment:", linkedAssessmentId);
        } catch (linkError) {
          console.error("❌ [handleCombinedOtpVerification] Error linking specific anonymous assessment:", linkError);
        }
      } else {
        console.log("🔍 [handleCombinedOtpVerification] No specific anonymous assessment ID, searching by device fingerprint");
        try {
          const linkedAssessments = await findAndLinkAnonymousAssessments(user.id, company.id);
          if (linkedAssessments.length > 0) {
            linkedAssessmentId = linkedAssessments[0].id;
            console.log("✅ [handleCombinedOtpVerification] Successfully linked assessments via device fingerprint:", linkedAssessments.length);
          }
        } catch (linkError) {
          console.error("❌ [handleCombinedOtpVerification] Error linking assessments via device fingerprint:", linkError);
        }
      }

      console.log("📅 [handleCombinedOtpVerification] Creating schedule request", {
        userId: user.id,
        companyId: company.id,
        preferredDate: combinedFormData.selectedDate,
        timesCount: combinedFormData.selectedTimes.length,
        linkedAssessmentId
      });
      
      // Create the schedule request with the combined form data
      const { data: result } = await scheduleRequest({
        preferredDate: new Date(combinedFormData.selectedDate!)
          .toISOString()
          .split("T")[0]!,
        preferredTimes: combinedFormData.selectedTimes,
        initiatorUserId: user.id,
        companyId: company.id,
        status: "PENDING",
        type: "TIER1_FOLLOWUP",
        remarks: combinedFormData.remarks,
        assessmentInstanceId: linkedAssessmentId || userTier1Assessments?.[0]?.id,
        metadata: JSON.stringify({
          userEmail: combinedFormData.email,
          userName: combinedFormData.name,
          companyDomain: company.primaryDomain!,
          companyName: combinedFormData.companyName,
          userJobTitle: combinedFormData.jobTitle,
          assessmentScore: score.overallScore,
          wasAnonymous: !!state.anonymousAssessmentId,
          linkedAssessmentId: linkedAssessmentId
        }),
      });

      console.log("📅 [handleCombinedOtpVerification] Schedule request result:", {
        success: !!result,
        resultId: result?.id
      });
      
      // Close the OTP modal
      console.log("🧹 [handleCombinedOtpVerification] Cleaning up state");
      setShowCombinedOtp(false);
      setCombinedFormData(null);
      setIsAuthInProgress(false);

      if (result) {
        console.log("✅ [handleCombinedOtpVerification] Success - showing success toast");
        showToast({
          type: "success",
          title: "Success!",
          message:
            "Your account has been created and follow-up call has been scheduled. We'll contact you soon!",
          duration: 6000,
        });
      } else {
        console.log("⚠️ [handleCombinedOtpVerification] Partial success - account created but scheduling failed");
        showToast({
          type: "warning",
          title: "Partial Success",
          message:
            "Your account was created successfully, but there was an issue scheduling the call. Please try scheduling again.",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("❌ [handleCombinedOtpVerification] Error in combined OTP verification:", error);
      setShowCombinedOtp(false);
      setCombinedFormData(null);
      setIsAuthInProgress(false);

      showToast({
        type: "error",
        title: "Error",
        message:
          "There was an issue processing your request. Your account may have been created - please try logging in.",
        duration: 6000,
      });
    }
  };

  const handleScheduleClick = () => {
    console.log("🎯 [handleScheduleClick] Schedule button clicked");
    setShowCombinedForm(true);
    console.log("✅ [handleScheduleClick] Set showCombinedForm to true");
  };

  const handleCancelCombinedForm = () => {
    console.log("❌ [handleCancelCombinedForm] Canceling combined form");
    setShowCombinedForm(false);
    setCombinedFormData(null);
    setIsAuthInProgress(false);
    console.log("🧹 [handleCancelCombinedForm] Cleaned up all state");
  };

  const handleCancelCombinedOtp = () => {
    console.log("❌ [handleCancelCombinedOtp] Canceling OTP verification");
    setShowCombinedOtp(false);
    setCombinedFormData(null);
    setIsAuthInProgress(false);
    setShowCombinedForm(true); // Go back to form
    console.log("🔄 [handleCancelCombinedOtp] Returning to form");
  };

  console.log("🎯 [useCombinedScheduleFlow] Returning hook values", {
    showCombinedForm,
    showCombinedOtp,
    hasCombinedFormData: !!combinedFormData
  });
  
  return {
    showCombinedForm,
    showCombinedOtp,
    combinedFormData,
    handleCombinedFormSubmit,
    handleCombinedOtpVerification,
    handleScheduleClick,
    handleCancelCombinedForm,
    handleCancelCombinedOtp,
  };
}