import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
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
    navigate('/tier2');
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
    <main className="flex-1 p-8">
      <div className="max-w-none mx-8">
        {/* Previous Assessment Results */}
        {firstPreviousAssessment && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div
                  style={{
                    backgroundColor: getScoreColor(
                      JSON.parse(firstPreviousAssessment.score).overallScore
                    ),
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                >
                  {JSON.parse(firstPreviousAssessment.score).overallScore}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Current Status:{" "}
                    {JSON.parse(firstPreviousAssessment.score).maturityLevel}{" "}
                    Level
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Completed on{" "}
                        {new Date(
                          firstPreviousAssessment.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
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

              <div className="flex items-center space-x-3">
                {/* Schedule a follow-up call Button - only show if user has completed assessment */}
                {!!firstPreviousAssessment && (
                  <button
                    onClick={handleScheduleCall}
                    className="flex items-center space-x-2 bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule a follow-up call</span>
                  </button>
                )}

                {/* Recommendations Toggle Button */}
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-700 font-medium">
                    {showRecommendations ? "Hide" : "Show"} Recommendations
                  </span>
                  {showRecommendations ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-4 bg-white/60 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Your previous responses are pre-selected below.</strong>{" "}
                You can modify any answers and resubmit to update your score.
              </p>
            </div>

            {/* Expandable Recommendations Panel */}
            {showRecommendations && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
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
                          <div className="flex items-start space-x-3">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                              style={{ backgroundColor: scoreColor }}
                            >
                              <span className="text-white text-xs font-bold">
                                !
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-1">
                                Priority Focus ({formatStringToTitle(recommendations[0].pillar || '')})
                              </h5>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {recommendations[0].text}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Recommendations */}
                      {recommendations.length > 1 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">
                            Additional Focus Areas:
                          </h5>
                          <div className="grid gap-3">
                            {recommendations
                              .splice(1, 10)
                              .sort((a, b) => {
                                const aIndex = a.maturityLevel ? maturityOrder.indexOf(a.maturityLevel) : 999;
                                const bIndex = b.maturityLevel ? maturityOrder.indexOf(b.maturityLevel) : 999;
                                return aIndex - bIndex;
                              })
                              .map((recommendation, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
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
                                    <p className="text-gray-700 text-sm leading-relaxed flex-1">
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
          </div>
        )}

        {/* Current Assessment */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">
              {/* {previousAssessments && previousAssessments.length > 0
                ? "Take Assessment Again"
                : "Albert Invent | Digital Readiness Assessment Tier 1 Assessment"} */}
              Tier 1 Assessment
            </h2>
            <p className="text-black mb-6">
              Please answer all questions to complete your assessment.
            </p>

            <div className="flex justify-between items-center mb-6">
              {/* Request In-Depth Assessment Button - only show if user has completed assessment */}
              {!!firstPreviousAssessment && (
                <button
                  onClick={handleRequestTier2}
                  className="flex items-center space-x-2 bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Request In-Depth Assessment</span>
                </button>
              )}

              <LoadingButton
                onClick={handleSubmit}
                loading={submittingAssesment}
                loadingText="Submitting..."
                disabled={!isAllAnswered || !ifDataChanged}
                size="md"
              >
                Submit Assessment
              </LoadingButton>
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">
                    Focus Areas
                  </th>
                  {maturityLabels.map((level: any) => (
                    <th
                      key={level}
                      className="text-center p-4 font-semibold text-gray-700 border-b min-w-48"
                    >
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-800 bg-gray-50 align-top">
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Progress: {Object.keys(selectedResponses).length} of{" "}
              {questions.length} questions answered
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
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
