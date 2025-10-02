import {
  BarChart3,
  Calendar,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getMaturityLevel, getScoreColor } from "../utils/common";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { RecommendationsPanel } from "./ui/RecommendationsPanel";
import { ScheduleCallModal, ScheduleCallData } from "./ui/ScheduleCallModal";
import { useAssessment } from "../hooks/useAssesment";
import { useToast } from "../context/ToastContext";
import { useCallRequest } from "../hooks/useCallRequest";
import { useAssessment } from "../hooks/useAssesment";
import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "./ui/Loader";
import { useEffect } from "react";

interface Tier1ResultsProps {
  onNavigateToTier2: () => void;
  onRetakeAssessment: () => void;
}

export function Tier1Results({
  onNavigateToTier2,
  onRetakeAssessment,
}: Tier1ResultsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { state } = useAppContext();
  const { userTier1Assessments, fetchUserAssessments } = useAssessment();
  const { showToast } = useToast();
  const { scheduleRequest } = useCallRequest();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
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

  const getRecommendations = (score: number): string[] => {
    if (score >= 85) {
      return [
        "Continue to innovate and lead in digital transformation",
        "Share best practices across the organization",
        "Explore advanced AI and automation opportunities",
      ];
    }
    if (score >= 70) {
      return [
        "Focus on scaling successful digital initiatives",
        "Strengthen data governance and integration",
        "Invest in advanced analytics capabilities",
      ];
    }
    if (score >= 50) {
      return [
        "Prioritize foundational digital infrastructure",
        "Develop digital skills across teams",
        "Establish clear data governance frameworks",
      ];
    }
    return [
      "Begin with basic digital transformation initiatives",
      "Focus on data standardization and integration",
      "Build digital culture and leadership support",
    ];
  };

  const maturityLevel = getMaturityLevel(score.overallScore);
  const scoreColor = getScoreColor(score.overallScore);

  const handleScheduleClick = () => {
    if (isLoggedIn) {
      setShowScheduleModal(true);
    } else {
      // Redirect to login for scheduling
      showToast({
        type: "info",
        title: "Login Required",
        message: "Please log in to schedule a follow-up call.",
        duration: 4000,
      });
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
            className="mb-12"
            defaultExpanded={true}
            showToggleButton={false}
            maxRecommendations={10}
          />

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {isLoggedIn ? (
              <button
                onClick={handleScheduleClick}
                className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-white py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 min-w-[320px] whitespace-nowrap"
                style={{ backgroundColor: "#05f" }}
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule a follow-up call</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  showToast({
                    type: "info",
                    title: "Login to Schedule",
                    message: "Create an account to schedule follow-up calls and access advanced features.",
                    duration: 5000,
                  });
                }}
                className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-white py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 min-w-[320px] whitespace-nowrap"
                style={{ backgroundColor: "#05f" }}
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign up to schedule calls</span>
              </button>
            )}

            <button
              onClick={onNavigateToTier2}
              className="flex items-center justify-center space-x-2 text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 min-w-[320px] whitespace-nowrap"
              style={{ backgroundColor: "#05f" }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Request In-Depth Assessment</span>
            </button>

            <button
              onClick={onRetakeAssessment}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 min-w-[320px] whitespace-nowrap"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            {isLoggedIn ? (
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
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  🎉 Great job completing the assessment!
                </p>
                <p className="text-blue-700 text-sm">
                  Sign up to save your results, schedule follow-up calls, and access our in-depth Tier 2 assessment.
                  Your results will be automatically linked to your account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      {isLoggedIn && (
        <ScheduleCallModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleSubmit}
          title="Schedule a Follow-up Call"
        />
      )}
    </main>
  );
}
