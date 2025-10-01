import {
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { getMaturityLevel, getScoreColor } from "../utils/common";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { RecommendationsPanel } from "./ui/RecommendationsPanel";
import { ScheduleCallModal, ScheduleCallData } from "./ui/ScheduleCallModal";
import { useAppContext } from "../context/AppContext";
import { useAssessment } from "../hooks/useAssesment";
import { useToast } from "../context/ToastContext";
import { useCallRequest } from "../hooks/useCallRequest";

interface Tier1ResultsProps {
  score: Tier1ScoreResult;
  onNavigateToTier2: () => void;
  onRetakeAssessment: () => void;
}

export function Tier1Results({
  score,
  onNavigateToTier2,
  onRetakeAssessment,
}: Tier1ResultsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { state } = useAppContext();
  const { userTier1Assessments } = useAssessment();
  const { showToast } = useToast();
  const { scheduleRequest } = useCallRequest();

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
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (data: ScheduleCallData) => {
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
            <button
              onClick={handleScheduleClick}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-white py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200 min-w-[320px] whitespace-nowrap"
              style={{ backgroundColor: "#05f" }}
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule a follow-up call</span>
            </button>

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
            <p className="text-gray-500 text-sm">
              This assessment provides a high-level overview. For detailed
              insights and strategic planning, consider our Tier 2 in-depth
              assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSubmit}
        title="Schedule a Follow-up Call"
      />
    </main>
  );
}
