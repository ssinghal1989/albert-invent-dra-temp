import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle,
  BarChart3,
  Clock,
  Flag
} from 'lucide-react';
import { useAssessment } from '../hooks/useAssesment';
import { Loader } from './ui/Loader';
import { LoadingButton } from './ui/LoadingButton';
import { Tier2TemplateId } from '../services/defaultQuestions';
import { questionsService } from '../services/questionsService';
import { useLoader } from '../hooks/useLoader';

interface Tier2AssessmentQuestionsProps {
  onComplete: (responses: Record<string, string>) => void;
  onBack: () => void;
}

export function Tier2AssessmentQuestions({ onComplete, onBack }: Tier2AssessmentQuestionsProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showQuestionJumper, setShowQuestionJumper] = useState(false);
  
  const { isLoading: questionsLoading, withLoading: withQuestionsLoading } = useLoader();
  const { submittingAssesment, setSubmittingAssesment } = useAssessment();

  // Load questions from database on component mount
  useEffect(() => {
    loadQuestionsFromDatabase();
  }, []);

  const loadQuestionsFromDatabase = async () => {
    await withQuestionsLoading(async () => {
      try {
        const result = await questionsService.getQuestionsByTemplate(Tier2TemplateId);
        if (result.success && result.data) {
          const sortedQuestions = result.data.sort((a, b) => a.order - b.order);
          setQuestions(sortedQuestions);
        } else {
          console.error("Failed to load questions from database:", result.error);
          throw new Error("Failed to load assessment questions");
        }
      } catch (error) {
        console.error("Error loading Tier 2 questions:", error);
        throw error;
      }
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (questionId: string, optionValue: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowQuestionJumper(false);
  };

  const handleSubmit = () => {
    setSubmittingAssesment(true);
    onComplete(responses);
  };

  const isCurrentQuestionAnswered = currentQuestion && responses[currentQuestion.id];
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  // Show loading state while questions are being loaded
  if (questionsLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="text-red-500 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Failed to Load Assessment</h3>
              <p className="text-gray-600 mt-2">Unable to load assessment questions from database</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={loadQuestionsFromDatabase}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Info</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestionJumper(!showQuestionJumper)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <Flag className="w-4 h-4" />
              <span className="text-sm font-medium">Jump to Question</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Jumper */}
          {showQuestionJumper && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Jump to Question:</h4>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-white'
                        : responses[questions[index]?.id]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {currentQuestion && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentQuestion.prompt}
                </h2>
                {currentQuestion.helpText && (
                  <p className="text-gray-600 mb-6">
                    {currentQuestion.helpText}
                  </p>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options?.map((option: any) => {
                  const isSelected = responses[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-blue-50 text-primary'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-4">
                  {/* Submit Button (only show on last question if all answered) */}
                  {currentQuestionIndex === totalQuestions - 1 && isAllAnswered && (
                    <LoadingButton
                      onClick={handleSubmit}
                      loading={submittingAssesment}
                      loadingText="Submitting..."
                      className="px-8 py-3"
                    >
                      Submit Assessment
                    </LoadingButton>
                  )}

                  {/* Next Button */}
                  {currentQuestionIndex < totalQuestions - 1 && (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Answer Status */}
              <div className="mt-6 text-center">
                {isCurrentQuestionAnswered ? (
                  <p className="text-sm text-green-600 flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Question answered</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Please select an answer to continue
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}