import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getMaturityLevel } from "../utils/common";
import { useAssessment } from "../hooks/useAssesment";
import { useToast } from "../context/ToastContext";
import { useCallRequest } from "../hooks/useCallRequest";
import { Loader } from "./ui/Loader";
import { ScheduleCallModal, ScheduleCallData } from "./ui/ScheduleCallModal";
import { RecommendationsPanel } from "./ui/RecommendationsPanel";

// Import modular components
import { ScoreDisplay } from "./tier1-results/ScoreDisplay";
import { AssessmentSummary } from "./tier1-results/AssessmentSummary";
import { ActionButtons } from "./tier1-results/ActionButtons";
import { Tier2Recommendation } from "./tier1-results/Tier2Recommendation";
import { SignupFlow } from "./tier1-results/SignupFlow";
import { CombinedScheduleFlow } from "./tier1-results/CombinedScheduleFlow";

// Import custom hooks
import { useSignupFlow } from "./tier1-results/hooks/useSignupFlow";
import { useCombinedScheduleFlow } from "./tier1-results/hooks/useCombinedScheduleFlow";

interface Tier1ResultsProps {
  onNavigateToTier2: () => void;
  onRetakeAssessment: () => void;
}

export function Tier1Results({
  onNavigateToTier2,
  onRetakeAssessment,
}: Tier1ResultsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { state } = useAppContext();
  const { userTier1Assessments, fetchUserAssessments } = useAssessment();
  const { showToast } = useToast();
  const { scheduleRequest } = useCallRequest();
  const location = useLocation();
  
  // Check if user is logged in
  const isLoggedIn = !!state.loggedInUserDetails;

  // Get score from state or user assessments
  const score = state.tier1Score || 
    (userTier1Assessments?.[0] ? JSON.parse(userTier1Assessments[0].score) : null);

  // Custom hooks for modular flows
  const signupFlow = useSignupFlow();
  const combinedScheduleFlow = useCombinedScheduleFlow(score);

  // Load assessments if user is logged in and we don't have score
  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn && !score) {
        await fetchUserAssessments();
      }
      setLoading(false);
    };
    loadData();
  }, [isLoggedIn, score, fetchUserAssessments]);

  // Show loading while fetching data
  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <Loader text="Loading your results..." size="lg" />
          </div>
        </div>
      </main>
    );
  }

  // Redirect to home if no score available
  if (!score) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const maturityLevel = getMaturityLevel(score.overallScore);

  const handleScheduleClick = () => {
    if (isLoggedIn) {
      setShowScheduleModal(true);
    } else {
      // Show combined form for anonymous users
      combinedScheduleFlow.handleScheduleClick();
    }
  };

  const handleSignUpToSave = () => {
    if (isLoggedIn) {
      showToast({
        type: "info",
        title: "Already Logged In",
        message: "Your results are already saved to your account.",
        duration: 3000,
      });
    } else {
      signupFlow.handleSignUpToSave();
    }
  };

  const handleScheduleSubmit = async (data: ScheduleCallData) => {
    if (!isLoggedIn) {
      showToast({
        type: "error",
        title: "Authentication Required",
        message: "Please log in to schedule a call.",
        duration: 4000,
      });
      return;
    }
    
    try {
      const { data: result } = await scheduleRequest({
        preferredDate: new Date(data.selectedDate!)
          .toISOString()
          .split("T")[0]!,
        preferredTimes: data.selectedTimes,
        initiatorUserId: state.userData?.id,
        companyId: state.company?.id,
        status: "PENDING",
        type: "TIER1_FOLLOWUP",
        remarks: data.remarks,
        assessmentInstanceId: userTier1Assessments?.[0]?.id,
        metadata: JSON.stringify({
          userEmail: state.userData?.email!,
          userName: state.userData?.name!,
          companyDomain: state.company?.primaryDomain!,
          companyName: state.company?.name!,
          userJobTitle: state.userData?.jobTitle!,
          assessmentScore: score.overallScore,
        }),
      });

      if (result) {
        showToast({
          type: "success",
          title: "Follow-up Call Requested!",
          message:
            "We've received your request and will contact you soon to schedule your follow-up call.",
          duration: 6000,
        });
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
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Your Digital Readiness Score
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Here's where you stand</p>
          </div>

          {/* Score Display */}
          <ScoreDisplay 
            score={score.overallScore} 
            maturityLevel={maturityLevel} 
          />

          {/* Assessment Summary */}
          <AssessmentSummary 
            score={score.overallScore} 
            maturityLevel={maturityLevel} 
          />

          {/* Priority Recommendation */}
          <RecommendationsPanel
            scoreData={score}
            className="mb-8"
            defaultExpanded={true}
            showToggleButton={false}
            maxRecommendations={10}
          />

          {/* Action Buttons */}
          <ActionButtons
            isLoggedIn={isLoggedIn}
            onScheduleClick={handleScheduleClick}
            onNavigateToTier2={onNavigateToTier2}
            onSignUpToSave={handleSignUpToSave}
            onRetakeAssessment={onRetakeAssessment}
          />

          {/* Tier 2 Recommendation */}
          <Tier2Recommendation scoreData={score} />
        </div>
      </div>

      {/* Schedule Call Modal - For logged in users */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSubmit}
        title="Schedule a Follow-up Call"
      />

      {/* Signup Flow - For anonymous users wanting to save results */}
      <SignupFlow
        showSignupForm={signupFlow.showSignupForm}
        showSignupOtp={signupFlow.showSignupOtp}
        signupFormData={signupFlow.signupFormData}
        onSignupFormSubmit={signupFlow.handleSignupFormSubmit}
        onSignupOtpVerification={signupFlow.handleSignupOtpVerification}
        onCancelSignupForm={signupFlow.handleCancelSignupForm}
        onCancelSignupOtp={signupFlow.handleCancelSignupOtp}
      />

      {/* Combined Schedule Flow - For anonymous users wanting to schedule */}
      <CombinedScheduleFlow
        showCombinedForm={combinedScheduleFlow.showCombinedForm}
        showCombinedOtp={combinedScheduleFlow.showCombinedOtp}
        combinedFormData={combinedScheduleFlow.combinedFormData}
        onCombinedFormSubmit={combinedScheduleFlow.handleCombinedFormSubmit}
        onCombinedOtpVerification={combinedScheduleFlow.handleCombinedOtpVerification}
        onCancelCombinedForm={combinedScheduleFlow.handleCancelCombinedForm}
        onCancelCombinedOtp={combinedScheduleFlow.handleCancelCombinedOtp}
      />
    </main>
  );
}