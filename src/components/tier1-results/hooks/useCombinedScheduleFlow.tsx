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
  
  
  const [showCombinedForm, setShowCombinedForm] = useState(false);
  const [showCombinedOtp, setShowCombinedOtp] = useState(false);
  const [combinedFormData, setCombinedFormData] = useState<CombinedScheduleData | null>(null);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

  const { showToast } = useToast();
  const { state, dispatch } = useAppContext();
  const { scheduleRequest } = useCallRequest();
  const { 
    userTier1Assessments, 
    linkAnonymousAssessment, 
    findAndLinkAnonymousAssessments 
  } = useAssessment();

  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    
    
    
    dispatch({ type: "LOGIN_NEXT_STEP", payload: nextStep });
    
    
    // Set OTP screen to show and hide form
    setTimeout(() => {
      
      setShowCombinedForm(false);
      
      setShowCombinedOtp(true);
      
      setIsAuthInProgress(false);
      
    }, 100);
  };

  const { handleAuth } = useAuthFlow(updateStateAndNavigateToOtp);

  const handleCombinedFormSubmit = async (data: CombinedScheduleData) => {
    
    try {
      // Prevent multiple submissions
      if (isAuthInProgress) {
        
        return;
      }

      // Validate email domain
      
      if (!ifDomainAlloeded(getDomainFromEmail(data.email)!)) {
        
        showToast({
          type: "error",
          title: "Invalid Email",
          message: "Please use your work email address",
          duration: 5000,
        });
        return;
      }
      

      // Store the form data for later use
      
      setCombinedFormData(data);

      // Trigger auth flow directly
      
      setIsAuthInProgress(true);
      
      
      try {
        dispatch({ type: "SET_LOGIN_EMAIL", payload: data.email });
        
        
        await handleAuth(data.email);
        
      } catch (error) {
        console.error("❌ [handleCombinedFormSubmit] Error in auth flow:", error);
        setIsAuthInProgress(false);
        setCombinedFormData(null);
        
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
    
    try {
      if (!combinedFormData) {
        
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
        showToast({
          type: "error",
          title: "Error",
          message: "User verification failed. Please try again.",
          duration: 5000,
        });
        return;
      }
      let linkedAssessmentId = null;
      
      if (state.anonymousAssessmentId) {
        
        try {
          const linkedAssessment = await linkAnonymousAssessment(
            state.anonymousAssessmentId,
            user.id,
            company.id
          );
          linkedAssessmentId = linkedAssessment?.id;
          
        } catch (linkError) {
          console.error("❌ [handleCombinedOtpVerification] Error linking specific anonymous assessment:", linkError);
        }
      } else {
        
        try {
          const linkedAssessments = await findAndLinkAnonymousAssessments(user.id, company.id);
          if (linkedAssessments.length > 0) {
            linkedAssessmentId = linkedAssessments[0].id;
            
          }
        } catch (linkError) {
          console.error("❌ [handleCombinedOtpVerification] Error linking assessments via device fingerprint:", linkError);
        }
      }
      
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
      
      // Close the OTP modal
      
      setShowCombinedOtp(false);
      setCombinedFormData(null);
      setIsAuthInProgress(false);

      if (result) {
        
        showToast({
          type: "success",
          title: "Success!",
          message:
            "Your account has been created and follow-up call has been scheduled. We'll contact you soon!",
          duration: 6000,
        });
      } else {
        
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
    
    setShowCombinedForm(true);
    
  };

  const handleCancelCombinedForm = () => {
    
    setShowCombinedForm(false);
    setCombinedFormData(null);
    setIsAuthInProgress(false);
    
  };

  const handleCancelCombinedOtp = () => {
    
    setShowCombinedOtp(false);
    setCombinedFormData(null);
    setIsAuthInProgress(false);
    setShowCombinedForm(true); // Go back to form
    
  };
  
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