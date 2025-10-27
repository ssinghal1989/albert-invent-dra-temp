import { AlertCircle, BarChart3, RefreshCw, TrendingUp } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Tier2ScoreResult } from "../utils/tier2ScoreCalculator";

interface Tier2ResultsProps {
  onRetakeAssessment: () => void;
  onNavigateBack: () => void;
  assessments?: any[];
}

export function Tier2Results({
  onRetakeAssessment,
  onNavigateBack,
  assessments,
}: Tier2ResultsProps) {
  const { state } = useAppContext();
  const location = useLocation();

  const isLoggedIn = !!state.loggedInUserDetails;

  // Use passed assessments or empty array
  const userTier2Assessments = assessments || [];

  // Get latest assessment (sorted by createdAt in descending order)
  const latestAssessment = userTier2Assessments?.[0];
  const score: Tier2ScoreResult | null = latestAssessment
    ? JSON.parse(latestAssessment.score as string)
    : null;

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!score) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const handleRetake = () => {
    onRetakeAssessment();
  };

  const getMaturityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'world class':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'established':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'emerging':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tier 2 Assessment Results
              </h1>
              <p className="text-gray-600">
                Detailed Digital Readiness Analysis
              </p>
            </div>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Assessment
            </button>
          </div>

          {/* Overall Score Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Overall Readiness Score
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-gray-900">
                    {score.normalizedShiftedScore}
                  </span>
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl border ${getMaturityColor(score.maturityLevel)}`}>
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-semibold">{score.maturityLevel}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Scenario</p>
                <p className="text-lg font-semibold text-gray-800">
                  {score.scenarioSimulated}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar Breakdown */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Pillar Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {score.pillarScores.map((pillar) => {
              const percentage = Math.round((pillar.rawScore / pillar.maxRawScore) * 100);
              return (
                <div
                  key={pillar.pillar}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {pillar.pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pillar.dimensionCount} dimensions
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-600">Raw Score</span>
                      <span className="text-lg font-bold text-gray-900">
                        {pillar.rawScore} / {pillar.maxRawScore}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          percentage >= 75
                            ? 'bg-green-500'
                            : percentage >= 50
                            ? 'bg-blue-500'
                            : percentage >= 25
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-right">
                      <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Details */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Score Calculation Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Total Raw Score</span>
                <span className="font-semibold text-gray-900">
                  {score.totalRawScore} / 80
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Weighted Score</span>
                <span className="font-semibold text-gray-900">
                  {score.weightedScore.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Normalized Score</span>
                <span className="font-semibold text-gray-900">
                  {score.normalizedScore}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-blue-700 font-medium">Final Score</span>
                <span className="font-bold text-blue-900 text-xl">
                  {score.normalizedShiftedScore}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  About the Scoring
                </p>
                <p className="text-sm text-blue-800">
                  The Tier 2 assessment uses a weighted scoring system across 20 dimensions.
                  Digitalization (40%), Transformation (30%), and Value Scaling (30%) are weighted
                  to calculate your final readiness score.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment History */}
        {userTier2Assessments && userTier2Assessments.length > 1 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assessment History
            </h2>
            <div className="space-y-3">
              {userTier2Assessments.slice(0, 5).map((assessment, index) => {
                const assessmentScore: Tier2ScoreResult = JSON.parse(assessment.score as string);
                const date = new Date(assessment.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={assessment.id}
                    className={`flex justify-between items-center p-4 rounded-xl ${
                      index === 0
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                          Current
                        </span>
                      )}
                      <span className="text-gray-700">{date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold ${getMaturityColor(assessmentScore.maturityLevel)} px-3 py-1 rounded-lg text-sm border`}>
                        {assessmentScore.maturityLevel}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {assessmentScore.normalizedShiftedScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center pb-8">
          <button
            onClick={onNavigateBack}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
