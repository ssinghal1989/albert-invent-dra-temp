import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "../hooks/useAssesment";
import { useLoader } from "../hooks/useLoader";
import { Tier1TemplateId } from "../services/defaultQuestions";
import { questionsService } from "../services/questionsService";
import { formatStringToTitle, getScoreColor } from "../utils/common";
import {
  generateRecommendations,
  getMaturityColor,
  getPillarColor,
} from "../utils/recommendationsGenerator";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { Loader } from "./ui/Loader";
import { LoadingButton } from "./ui/LoadingButton";
import { ScheduleCallModal, ScheduleCallData } from "./ui/ScheduleCallModal";
import { useAppContext } from "../context/AppContext";
import { useCallRequest } from "../hooks/useCallRequest";
import { useToast } from "../context/ToastContext";

interface Tier1AssessmentProps {
  onComplete: (responses: Record<string, string>, questions: any[]) => void;
}

const maturityOrder = ["BASIC", "EMERGING", "ESTABLISHED", "WORLD_CLASS"];

export function Tier1Assessment({ onComplete }: Tier1AssessmentProps) {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { scheduleRequest } = useCallRequest();
  const { showToast } = useToast();
  const { isLoading: questionsLoading, withLoading: withQuestionsLoading } =
    useLoader();

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedResponses, setSelectedResponses] = useState<
    Record<string, string>
  >({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { userTier1Assessments, submittingAssesment, setSubmittingAssesment } =
    useAssessment();

  const handleRequestTier2 = () => {
    navigate("/tier2");
  };

  const handleScheduleCall = () => {
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
          assessmentScore: userTier1Assessments?.[0]
            ? JSON.parse(userTier1Assessments[0].score).overallScore
            : 0,
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
  // Load questions from database on component mount
  useEffect(() => {
    loadQuestionsFromDatabase();
  }, []);

  const loadQuestionsFromDatabase = async () => {
    await withQuestionsLoading(async () => {
      // Load questions for Tier 1 template
      const result = await questionsService.getQuestionsByTemplate(
        Tier1TemplateId
      );
      if (result.success && result.data) {
        // Sort questions by order
        const sortedQuestions = result.data.sort((a, b) => a.order - b.order);
        setQuestions(sortedQuestions);
      } else {
        console.error("Failed to load questions from database:", result.error);
        throw new Error("Failed to load assessment questions");
      }
    });
  };
  const maturityLevels =
    questions.length > 0 && questions[0].options
      ? maturityOrder.filter((level) =>
          questions[0].options.some((opt: any) => opt.value === level)
        )
      : [];
  const maturityLabels = maturityLevels.map((level) =>
    level
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );

  const handleOptionSelect = (question: any, optionValue: string) => {
    setSelectedResponses((prev) => ({
      ...prev,
      [question.id]: optionValue,
    }));
  };

  const isAllAnswered = questions.every(
    (question) => selectedResponses[question.id] !== undefined
  );

  const ifDataChanged =
    userTier1Assessments && userTier1Assessments.length > 0
      ? JSON.stringify(selectedResponses) !==
        JSON.stringify(JSON.parse(userTier1Assessments[0]?.responses || "{}"))
      : true;

  const handleSubmit = () => {
    setSubmittingAssesment(true);
    onComplete(selectedResponses, questions);
  };

  useEffect(() => {
    if (userTier1Assessments && userTier1Assessments.length > 0) {
      setSelectedResponses(
        JSON.parse(userTier1Assessments[0]?.responses || "{}")
      );
    }
  }, [userTier1Assessments]);

  const getSortedOptions = (question: any) => {
    const sortedOptions = question.options.sort((a: any, b: any) => {
      const aIndex = maturityOrder.indexOf(a.value);
      const bIndex = maturityOrder.indexOf(b.value);
      return aIndex - bIndex;
    });
    return sortedOptions;
  };

  const firstPreviousAssessment =
    userTier1Assessments && userTier1Assessments.length > 0
      ? userTier1Assessments[0]
      : null;

  // Show loading state while questions are being loaded
  if (questionsLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-none mx-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <Loader text="Loading assessment questions..." size="lg" />
          </div>
        </div>
      </main>
    );
  }

  // Show error state if questions failed to load
  if (questions.length === 0) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-none mx-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">
                Failed to Load Assessment
              </h3>
              <p className="text-gray-600 mt-2">
                Unable to load assessment questions from database
              </p>
            </div>
            <button
              onClick={loadQuestionsFromDatabase}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-2 sm:p-4 lg:p-8">
      <div className="max-w-none mx-1 sm:mx-2 lg:mx-8">
        {/* Previous Assessment Results */}
        {firstPreviousAssessment && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-blue-200">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-3 sm:mb-4">
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div
                  style={{
                    backgroundColor: getScoreColor(
                      JSON.parse(firstPreviousAssessment.score).overallScore
                    ),
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl shadow-lg flex-shrink-0"
                >
                  {JSON.parse(firstPreviousAssessment.score).overallScore}
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 leading-tight">
                    Current Status:{" "}
                    {JSON.parse(firstPreviousAssessment.score).maturityLevel}{" "}
                    Level
                  </h3>
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4 sm:space-y-0 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        Completed on{" "}
                        {new Date(
                          firstPreviousAssessment.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {
                          Object.keys(
                            JSON.parse(firstPreviousAssessment.responses)
                          ).length
                        }{" "}
                        questions answered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 lg:space-x-3">
                {/* Schedule a follow-up call Button - only show if user has completed assessment */}
                {!!firstPreviousAssessment && (
                  <button
                    onClick={handleScheduleCall}
                    className="flex items-center justify-center space-x-1 sm:space-x-2 bg-primary text-white py-2 px-2 sm:px-3 lg:px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">Schedule Call</span>
                  </button>
                )}

                {/* Recommendations Toggle Button */}
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm text-xs sm:text-sm lg:text-base"
                >
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                  <span className="text-gray-700 font-medium whitespace-nowrap hidden sm:inline">
                    {showRecommendations ? "Hide" : "Show"} Recommendations
                  </span>
                  <span className="text-gray-700 font-medium whitespace-nowrap sm:hidden">
                    {showRecommendations ? "Hide" : "Tips"}
                  </span>
                  {showRecommendations ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 bg-white/60 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-gray-700">
                <strong>Your previous responses are pre-selected below.</strong>{" "}
                You can modify any answers and resubmit to update your score.
              </p>
            </div>

            {/* Expandable Recommendations Panel */}
            {showRecommendations && (
              <div className="mt-3 sm:mt-4 bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <h4 className="text-sm sm:text-lg font-semibold text-gray-900">
                    Recommendations Based on Your Assessment
                  </h4>
                </div>

                {(() => {
                  const scoreData = JSON.parse(
                    firstPreviousAssessment.score
                  ) as Tier1ScoreResult;
                  const recommendations = scoreData?.pillarScores
                    ? generateRecommendations(scoreData)
                    : [];
                  const scoreColor = getScoreColor(scoreData.overallScore);

                  return (
                    <div className="space-y-3">
                      {/* Priority Recommendation */}
                      {recommendations.length > 0 && (
                        <div
                          className="bg-gradient-to-r  rounded-lg p-4 border-l-4"
                          style={{ borderColor: "#05f" }}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1"
                              style={{ backgroundColor: scoreColor }}
                            >
                              <span className="text-white text-xs font-bold">
                                !
                              </span>
                            </div>
                            <div>
                              <h5 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                Priority Focus (
                                {formatStringToTitle(
                                  recommendations[0].pillar || ""
                                )}
                                )
                              </h5>
                              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                {recommendations[0].text}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Recommendations */}
                      {recommendations.length > 1 && (
                        <div>
                          <h5 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
                            Additional Focus Areas:
                          </h5>
                          <div className="grid gap-2 sm:gap-3">
                            {recommendations
                              .splice(1, 10)
                              .sort((a, b) => {
                                const aIndex = a.maturityLevel
                                  ? maturityOrder.indexOf(a.maturityLevel)
                                  : 999;
                                const bIndex = b.maturityLevel
                                  ? maturityOrder.indexOf(b.maturityLevel)
                                  : 999;
                                return aIndex - bIndex;
                              })
                              .map((recommendation, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200"
                                >
                                  <div className="flex items-start space-x-2 sm:space-x-3">
                                    <div
                                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                      style={{
                                        backgroundColor:
                                          recommendation.maturityLevel
                                            ? getMaturityColor(
                                                recommendation.maturityLevel
                                              )
                                            : recommendation.pillar
                                            ? getPillarColor(
                                                recommendation.pillar
                                              )
                                            : scoreColor,
                                      }}
                                    >
                                      <span className="text-white text-xs font-bold">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed flex-1">
                                      {recommendation.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tier 2 Recommendation Section - Show when recommendations are expanded */}
            {showRecommendations && firstPreviousAssessment && (
              <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 lg:p-6">
                <p className="text-blue-800 text-sm sm:text-base font-medium mb-3 sm:mb-4">
                  Your Tier 1 results show that the following Focus Areas stand
                  out as key opportunities:
                </p>
                <ul className="text-blue-700 text-sm sm:text-base mb-3 sm:mb-4 space-y-1 sm:space-y-2">
                  {(() => {
                    const scoreData = JSON.parse(
                      firstPreviousAssessment.score
                    ) as Tier1ScoreResult;

                    // Calculate lowest scoring areas (same logic as in Tier1Results)
                    const getLowestScoringAreas = (
                      scoreData: Tier1ScoreResult
                    ): string[] => {
                      if (
                        !scoreData.focusAreaScores ||
                        scoreData.focusAreaScores.length === 0
                      ) {
                        return [];
                      }

                      // Priority order for tie-breaking
                      const priorityOrder = [
                        "Data Architecture and Integration",
                        "Data Governance and Trust",
                        "Smart Lab and Workflow Automation",
                        "Leadership and Digital Culture",
                        "Analytics and AI-driven Discovery",
                        "Manufacturing and Scale-up Integration",
                        "Skills and Workforce Enablement",
                        "Customer and Market Feedback Integration",
                        "Sustainability and Regulatory Intelligence",
                        "Supplier Ecosystem Connectivity",
                      ];

                      // Sort focus areas by score (lowest first), then by priority order for ties
                      const sortedAreas = [...scoreData.focusAreaScores].sort(
                        (a, b) => {
                          if (a.score !== b.score) {
                            return a.score - b.score; // Lower scores first
                          }
                          // If scores are equal, use priority order
                          const aIndex = priorityOrder.indexOf(a.focusArea);
                          const bIndex = priorityOrder.indexOf(b.focusArea);
                          return aIndex - bIndex;
                        }
                      );

                      // Return the 3 lowest scoring areas
                      return sortedAreas
                        .slice(0, 3)
                        .map((area) => area.focusArea);
                    };

                    const lowestScoringAreas = getLowestScoringAreas(scoreData);

                    return lowestScoringAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-xs sm:text-sm lg:text-base">{area}</span>
                      </li>
                    ));
                  })()}
                </ul>
                <p className="text-blue-800 text-sm sm:text-base font-medium">
                  We'd recommend a Tier 2 assessment to dive deeper into these
                  dimensions and uncover concrete opportunities to advance your
                  digital transformation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Assessment */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-sm border border-gray-200">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">
              {/* {previousAssessments && previousAssessments.length > 0
                ? "Take Assessment Again"
                : "Albert Invent | Digital Readiness Assessment Tier 1 Assessment"} */}
              Tier 1 Assessment
            </h2>
            <p className="text-black mb-3 sm:mb-4 lg:mb-6 text-xs sm:text-sm lg:text-base">
              Please answer all questions to complete your assessment.
            </p>

            <div className="hidden lg:flex lg:justify-between lg:items-center lg:space-x-4 mb-6">
              {/* Request In-Depth Assessment Button - only show if user has completed assessment */}
              <LoadingButton
                onClick={handleRequestTier2}
                loading={false}
                loadingText="Submitting..."
                className="text-base px-4 py-3"
              >
                Request In-Depth Assessment
              </LoadingButton>

              <LoadingButton
                onClick={handleSubmit}
                loading={submittingAssesment}
                loadingText="Submitting..."
                disabled={!isAllAnswered || !ifDataChanged}
                className="text-base px-4 py-3"
              >
                Submit Assessment
              </LoadingButton>
            </div>
          </div>

          {/* Assessment Grid */}

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-4">
            {questions.map((question, questionIndex) => {
              const isAnswered = selectedResponses[question.id] !== undefined;
              return (
                <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        isAnswered ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2">
                          {question.prompt}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Question {questionIndex + 1} of {questions.length}</span>
                          {isAnswered && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>Answered</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {getSortedOptions(question).map((option: any) => {
                      const isSelected = selectedResponses[question.id] === option.value;
                      return (
                        <button
                          key={`${question.id}_${option.value}`}
                          onClick={() => handleOptionSelect(question, option.value)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-blue-50 text-primary'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'border-primary bg-primary' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${
                              isSelected ? 'text-primary' : 'text-gray-900'
                            }`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit Buttons - After all questions on mobile */}
            <div className="mt-6 space-y-3">
              <LoadingButton
                onClick={handleRequestTier2}
                loading={false}
                loadingText="Submitting..."
                variant="outline"
                className="w-full text-sm py-3"
              >
                Request In-Depth Assessment
              </LoadingButton>
              <LoadingButton
                onClick={handleSubmit}
                loading={submittingAssesment}
                loadingText="Submitting..."
                disabled={!isAllAnswered || !ifDataChanged}
                className="w-full text-sm py-3"
              >
                Submit Assessment
              </LoadingButton>
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden lg:block overflow-x-auto -mx-6 xl:-mx-8 px-6 xl:px-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b text-base min-w-48 sticky left-0 bg-white">
                    Focus Areas
                  </th>
                  {maturityLabels.map((level: any) => (
                    <th
                      key={level}
                      className="text-center p-4 font-semibold text-gray-700 border-b min-w-48 text-base"
                    >
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-800 bg-gray-50 align-top text-base min-w-48 sticky left-0">
                      {question.prompt}
                    </td>
                    {getSortedOptions(question).map((option: any) => {
                      const isSelected =
                        selectedResponses[question.id] === option.value;
                      return (
                        <td
                          key={`${question.id}_${option.label}`}
                          className="p-2 align-top"
                        >
                          <div
                            onClick={() =>
                              handleOptionSelect(question, option.value)
                            }
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm leading-tight ${
                              isSelected
                                ? "text-white bg-blue-500"
                                : "text-black hover:bg-gray-100"
                            }`}
                          >
                            {option.label}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Progress: {Object.keys(selectedResponses).length} of{" "}
              {questions.length} questions answered
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
              <div
                className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (Object.keys(selectedResponses).length / questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
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
