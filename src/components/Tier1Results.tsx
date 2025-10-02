import {
  BarChart3,
  Calendar,
  TrendingUp,
  Save,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { LoginPage } from "./LoginPage";
import { getMaturityLevel, getScoreColor } from "../utils/common";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { RecommendationsPanel } from "./ui/RecommendationsPanel";
import { ScheduleCallModal, ScheduleCallData } from "./ui/ScheduleCallModal";
import { CombinedScheduleForm, CombinedScheduleData } from "./ui/CombinedScheduleForm";
import { useAssessment } from "../hooks/useAssesment";
import { useToast } from "../context/ToastContext";
import { useCallRequest } from "../hooks/useCallRequest";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader } from "./ui/Loader";
import { UserData } from "../context/AppContext";
import { OtpVerificationPage } from "./OtpVerificationPage";
import { useAuthFlow } from "../hooks/useAuthFlow";
import { LOGIN_NEXT_STEP } from "../context/AppContext";
import { getDomainFromEmail } from "../utils/common";
import { ifDomainAlloeded } from "../utils/domain";

interface Tier1ResultsProps {
  onNavigateToTier2: () => void;
  onRetakeAssessment: () => void;
}

export function Tier1Results({
  onNavigateToTier2,
  onRetakeAssessment,
}: Tier1ResultsProps) {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showCombinedForm, setShowCombinedForm] = useState(false);
  const { state } = useAppContext();
  const { userTier1Assessments, fetchUserAssessments } = useAssessment();
  const { showToast } = useToast();
  const { scheduleRequest } = useCallRequest();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [signupUserData, setSignupUserData] = useState<UserData | null>(null);
  const [combinedFormData, setCombinedFormData] = useState<CombinedScheduleData | null>(null);
  
  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    // We'll handle this inline since we're not navigating
  };
  
  const { handleAuth, loading: authLoading } = useAuthFlow(updateStateAndNavigateToOtp);
  
  // Check if user is logged in
  const isLoggedIn = !!state.loggedInUserDetails;

  // Get score from state or user assessments
  const score = state.tier1Score || 
    (userTier1Assessments?.[0] ? JSON.parse(userTier1Assessments[0].score) : null);

  // Calculate lowest scoring areas for recommendations
  const getLowestScoringAreas = (scoreData: Tier1ScoreResult): string[] => {
    if (!scoreData.focusAreaScores || scoreData.focusAreaScores.length === 0) {
      return [];
    }

    // Priority order for tie-breaking
    const priorityOrder = [
      'Data Architecture and Integration',
      'Data Governance and Trust', 
      'Smart Lab and Workflow Automation',
      'Leadership and Digital Culture',
      'Analytics and AI-driven Discovery',
      'Manufacturing and Scale-up Integration',
      'Skills and Workforce Enablement',
      'Customer and Market Feedback Integration',
      'Sustainability and Regulatory Intelligence',
      'Supplier Ecosystem Connectivity'
    ];

    // Sort focus areas by score (lowest first), then by priority order for ties
    const sortedAreas = [...scoreData.focusAreaScores].sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score; // Lower scores first
      }
      // If scores are equal, use priority order
      const aIndex = priorityOrder.indexOf(a.focusArea);
      const bIndex = priorityOrder.indexOf(b.focusArea);
      return aIndex - bIndex;
    });

    // Return the 3 lowest scoring areas
    return sortedAreas.slice(0, 3).map(area => area.focusArea);
  };

  const lowestScoringAreas = score ? getLowestScoringAreas(score) : [];

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
  const scoreColor = getScoreColor(score.overallScore);

  const handleScheduleClick = () => {
    if (isLoggedIn) {
      setShowScheduleModal(true);
    } else {
      // Show combined form for anonymous users
      setShowCombinedForm(true);
    }
  };

  const handleCombinedFormSubmit = async (data: CombinedScheduleData) => {
    try {
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
      
      // Trigger auth flow
      await handleAuth(data.email);
      
      // The auth flow will handle the rest through the existing OTP flow
      showToast({
        type: "info",
        title: "Verification Required",
        message: "Please check your email for the verification code",
        duration: 5000,
      });
      
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to process your request. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleSignupSubmit = (userData: UserData) => {
    setSignupUserData(userData);
    setShowSignupModal(false);
    setShowOtpModal(true);
  };

  const handleOtpVerification = async (data: any) => {
    // After successful verification, show schedule modal
    setShowOtpModal(false);
    setShowScheduleModal(true);
    
    showToast({
      type: "success",
      title: "Account Created!",
      message: "Your account has been created successfully. You can now schedule your follow-up call.",
      duration: 5000,
    });
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
      navigate("/email-login");
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
      const { data: result, errors } = await scheduleRequest({
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

  // Calculate circle properties for animated progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (score.overallScore / 100) * circumference;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Digital Readiness Score
            </h1>
            <p className="text-gray-600 text-lg">Here's where you stand</p>
          </div>

          {/* Score Circle and Details */}
          <div className="flex justify-center mb-12">
            {/* Score Visualization */}
            <div>
              <div className="relative">
                <svg width="280" height="280" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke={scoreColor}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      animation: "drawCircle 2s ease-out forwards",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="text-6xl font-bold"
                    style={{ color: scoreColor }}
                  >
                    {score.overallScore}
                  </div>
                  <div className="text-gray-500 text-lg font-medium mt-1">
                    {maturityLevel}
                  </div>
                  <div className="text-gray-400 text-sm">(Maturity Level)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Assessment Summary
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">
                  Digital Readiness Level
                </span>
                <span
                  className="font-bold text-xl"
                  style={{ color: scoreColor }}
                >
                  {maturityLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${score.overallScore}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>
              <div className="relative text-sm text-gray-500 mt-2">
                <span
                  className="absolute text-xs"
                  style={{ left: "12.5%", transform: "translateX(-50%)" }}
                >
                  Basic
                </span>
                <span
                  className="absolute text-xs"
                  style={{ left: "37.5%", transform: "translateX(-50%)" }}
                >
                  Emerging
                </span>
                <span
                  className="absolute text-xs"
                  style={{ left: "62.5%", transform: "translateX(-50%)" }}
                >
                  Established
                </span>
                <span
                  className="absolute text-xs whitespace-nowrap"
                  style={{ left: "87.5%", transform: "translateX(-50%)" }}
                >
                  World Class
                </span>
              </div>
            </div>
          </div>

          {/* Priority Recommendation */}
          <RecommendationsPanel
            scoreData={score}
            className="mb-8"
            defaultExpanded={true}
            showToggleButton={false}
            maxRecommendations={10}
          />

          {/* Action Buttons - 4 Buttons Layout Above Recommendations */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <button
                onClick={handleScheduleClick}
                className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
                style={{ backgroundColor: "#05f" }}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="leading-tight">Schedule a follow-up call</span>
              </button>

              <button
                onClick={onNavigateToTier2}
                className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
                style={{ backgroundColor: "#05f" }}
              >
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                <span className="leading-tight">Request In-Depth Assessment</span>
              </button>

              <button
                onClick={handleSignUpToSave}
                className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
                style={{ backgroundColor: "#05f" }}
              >
                <Save className="w-5 h-5 flex-shrink-0" />
                <span className="leading-tight">Sign up to save your results</span>
              </button>

              <button
                onClick={onRetakeAssessment}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-center"
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="leading-tight">Retake Assessment</span>
              </button>
            </div>
          </div>

          {/* Tier 2 Recommendation - Always Show */}
          <div className="mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
              <p className="text-blue-800 text-base font-medium mb-4">
                Your Tier 1 results show that the following Focus Areas stand out as key opportunities:
              </p>
              <ul className="text-blue-700 text-base mb-4 space-y-2">
                {lowestScoringAreas.map((area, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
              <p className="text-blue-800 text-base font-medium">
                We'd recommend a Tier 2 assessment to dive deeper into these dimensions and 
                uncover concrete opportunities to advance your digital transformation.
              </p>
            </div>
          </div>


        </div>
      </div>

      {/* Schedule Call Modal - For both logged in and newly signed up users */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSubmit}
        title="Schedule a Follow-up Call"
      />

      {/* Signup Modal for Anonymous Users */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <LoginPage 
              onLogin={handleSignupSubmit} 
              onCancel={() => setShowSignupModal(false)} 
            />
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && signupUserData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <OtpVerificationPage
              userEmail={signupUserData.email}
              onVerify={handleOtpVerification}
              onCancel={() => {
                setShowOtpModal(false);
                setSignupUserData(null);
              }}
            />
          </div>
        </div>
      )}
    </main>

    {/* Combined Schedule Form Modal - For anonymous users */}
    <CombinedScheduleForm
      isOpen={showCombinedForm}
      onClose={() => setShowCombinedForm(false)}
      onSubmit={handleCombinedFormSubmit}
      title="Schedule a Follow-up Call"
    />
  );
}
