import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, ChevronDown, ChevronUp, BarChart3, Lock, RotateCcw, Calendar } from 'lucide-react';
import { questionsService } from '../services/questionsService';
import { useAppContext } from '../context/AppContext';
import { useLoader } from '../hooks/useLoader';
import { Loader } from './ui/Loader';
import { LoadingButton } from './ui/LoadingButton';
import { calculateTier1Score, getScoreColor } from '../utils/scoreCalculator';

interface Question {
  id: string;
  sectionId: string;
  order: number;
  kind: string;
  prompt: string;
  required: boolean;
  options: Array<{
    id: string;
    label: string;
    value: string;
    score: number;
  }>;
}

interface Tier1AssessmentProps {
  previousAssessments?: Array<{
    id: string;
    submittedAt: string;
    scoreCard: {
      overallScore: number;
      bucketLabel: string;
    };
    responses: Array<{
      questionId: string;
      answer: any;
    }>;
  }>;
  onComplete: (responses: Record<string, string>) => void;
  onShowLogin: () => void;
}

export function Tier1Assessment({ 
  previousAssessments, 
  onComplete,
  onShowLogin
}: Tier1AssessmentProps) {
  const { state, dispatch } = useAppContext();
  const { isLoading: questionsLoading, withLoading: withQuestionsLoading } = useLoader();
  const { isLoading: submitLoading, withLoading } = useLoader();
  
  const [questions, setQuestions] = useState<Question[]>([]);

  // Use intermediate responses from context
  const selectedResponses = state.intermediateResponses;

  // Load questions from database on component mount
  useEffect(() => {
    loadQuestionsFromDatabase();
  }, []);

  // Pre-select answers from previous attempt when questions load
  useEffect(() => {
    if (questions.length > 0 && previousAssessments && previousAssessments.length > 0) {
      const previousAttempt = previousAssessments[0];
      const previousResponses: Record<string, string> = {};
      
      previousAttempt.responses.forEach(response => {
        const value = response.answer?.value || response.answer;
        if (value) {
          previousResponses[response.questionId] = value;
        }
      });
      
      // Only pre-select if user hasn't made any selections yet
      if (Object.keys(selectedResponses).length === 0) {
        dispatch({ 
          type: 'SET_INTERMEDIATE_RESPONSES', 
          payload: previousResponses 
        });
      }
    }
  }, [questions, previousAssessments, selectedResponses, dispatch]);
  const loadQuestionsFromDatabase = async () => {
    await withQuestionsLoading(async () => {
      // Load questions for Tier 1 template
      const result = await questionsService.getQuestionsByTemplate('tpl_01HZXXS3N9');
      if (result.success && result.data) {
        // Sort questions by order
        const sortedQuestions = result.data.sort((a, b) => a.order - b.order);
        setQuestions(sortedQuestions);
      } else {
        console.error('Failed to load questions from database:', result.error);
        throw new Error('Failed to load assessment questions');
      }
    });
  };

  // Get maturity levels from the first question's options (assuming all questions have same structure)
  // Define the correct order for maturity levels
  const maturityOrder = ['BASIC', 'EMERGING', 'ESTABLISHED', 'WORLD_CLASS'];
  
  const maturityLevels = questions.length > 0 && questions[0].options ? 
    maturityOrder.filter(level => 
      questions[0].options.some(opt => opt.value === level)
    ) : [];
    
  const maturityLabels = maturityLevels.map(level => 
    level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  );

  const handleOptionSelect = (questionId: string, optionValue: string) => {
    const updatedResponses = {
      ...selectedResponses,
      [questionId]: optionValue
    };
    
    // Save to context immediately
    dispatch({ 
      type: 'SET_INTERMEDIATE_RESPONSES', 
      payload: updatedResponses 
    });
  };

  const isAllAnswered = questions.every(question => 
    selectedResponses[question.id] !== undefined
  );

  const isLoggedIn = !!state.userData;

  // Get previous attempt data
  const previousAttempt = previousAssessments && previousAssessments.length > 0 ? previousAssessments[0] : null;
  const previousScore = previousAttempt ? calculateTier1Score(
    previousAttempt.responses.reduce((acc, response) => {
      const value = response.answer?.value || response.answer;
      if (value) {
        acc[response.questionId] = value;
      }
      return acc;
    }, {} as Record<string, string>)
  ) : null;
  const handleSubmit = () => {
    if (!isLoggedIn) {
      onShowLogin();
      return;
    }
    
    if (isAllAnswered && isLoggedIn) {
      withLoading(async () => {
        // Simulate assessment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear intermediate responses after successful submission
        dispatch({ type: 'CLEAR_INTERMEDIATE_RESPONSES' });
        
        onComplete(selectedResponses);
      });
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10b981'; // emerald-500 - World Class (green)
    if (score >= 70) return '#3b82f6'; // blue-500 - Established (blue)
    if (score >= 50) return '#f59e0b'; // amber-500 - Emerging (orange)
    return '#ef4444'; // red-500 - Basic (red)
  };

  const handleRetakeAssessment = () => {
    // Clear current selections to start fresh
    dispatch({ type: 'CLEAR_INTERMEDIATE_RESPONSES' });
  };

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
              <h3 className="text-lg font-semibold">Failed to Load Assessment</h3>
              <p className="text-gray-600 mt-2">Unable to load assessment questions from database</p>
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
        {/* Previous Attempt Score Card */}
        {previousScore && previousAttempt && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-200 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: getScoreColor(previousScore.overallScore) }}
                >
                  {previousScore.overallScore}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Previous Score: {previousScore.maturityLevel} Level
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Completed on {new Date(previousAttempt.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{previousScore.totalQuestions} questions answered</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRetakeAssessment}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 font-medium">Start Fresh</span>
              </button>
            </div>
            <div className="mt-4 bg-white/60 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Your previous responses are pre-selected below.</strong> You can modify any answers and resubmit to update your score.
              </p>
            </div>
          </div>
        )}

        {/* Current Assessment */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">
              {previousAttempt ? 'Update Your Assessment' : 'Albert Invent | Digital Readiness Assessment Tier 1'}
            </h2>
            <p className="text-black mb-6">
              Please click the cells that apply to your organization in the area below. 
              Once you have selected all your responses, please click submit to continue.
            </p>
            
            <div className="flex justify-end mb-6">
              <LoadingButton
                onClick={handleSubmit}
                loading={submitLoading}
                loadingText={isLoggedIn ? "Submitting..." : "Please login first..."}
                disabled={!isAllAnswered || (!isLoggedIn && submitLoading)}
                size="md"
              >
                {!isLoggedIn ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Login to Submit
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </LoadingButton>
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Focus Areas</th>
                  {maturityLabels.map(level => (
                    <th key={level} className="text-center p-4 font-semibold text-gray-700 border-b min-w-48">
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map(question => (
                  <tr key={question.id} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-800 bg-gray-50 align-top">
                      {question.prompt}
                    </td>
                    {question.options
                      .sort((a, b) => {
                        const aIndex = maturityOrder.indexOf(a.value);
                        const bIndex = maturityOrder.indexOf(b.value);
                        return aIndex - bIndex;
                      })
                      .map(option => {
                      const isSelected = selectedResponses[question.id] === option.value;
                      return (
                        <td key={option.id} className="p-2 align-top">
                          <div
                            onClick={() => handleOptionSelect(question.id, option.value)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm leading-tight ${
                              isSelected 
                                ? 'text-white bg-blue-500' 
                                : 'text-black hover:bg-gray-100'
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
              Progress: {Object.keys(selectedResponses).length} of {questions.length} questions answered
              {!isLoggedIn && Object.keys(selectedResponses).length > 0 && (
                <span className="text-primary ml-2">• Login required to submit</span>
              )}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.keys(selectedResponses).length / questions.length) * 100}%` 
                }}
              />
            </div>
            
            {!isLoggedIn && Object.keys(selectedResponses).length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Your progress is saved. Please login to submit your assessment.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}