import React from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Target, 
  Map,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react';

interface Tier2AssessmentInfoProps {
  onStartAssessment: () => void;
  onNavigateToSchedule: () => void;
}

export function Tier2AssessmentInfo({ onStartAssessment, onNavigateToSchedule }: Tier2AssessmentInfoProps) {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tier 2: In-Depth Assessment
            </h1>
            <p className="text-gray-600 text-lg">
              A comprehensive diagnostic workshop to guide strategic decisions
            </p>
          </div>

          {/* What's Included Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What's Included in Your Assessment
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Multi-Stakeholder Evaluation
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Evaluate maturity across different teams, functions, or sites to get a comprehensive view of your organization's digital readiness.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Strategic Prioritization
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Prioritize initiatives and investment opportunities based on organizational readiness and potential impact.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Clear Roadmap
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Define a clear, actionable roadmap with specific focus areas, timelines, and next steps for your digital transformation journey.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expert Insights
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Receive detailed insights and recommendations from our digital transformation experts based on your specific context and challenges.
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Assessment Details
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                  <p className="text-gray-600 text-sm">15-20 minutes</p>
                  <p className="text-gray-500 text-xs">19 comprehensive questions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Format</h4>
                  <p className="text-gray-600 text-sm">Interactive Assessment</p>
                  <p className="text-gray-500 text-xs">Navigate freely between questions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Outcome</h4>
                  <p className="text-gray-600 text-sm">Detailed Report</p>
                  <p className="text-gray-500 text-xs">With strategic recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Key Benefits
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Comprehensive evaluation across all digital maturity dimensions</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Detailed gap analysis with specific improvement recommendations</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Strategic roadmap aligned with your business objectives</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Benchmarking against industry best practices</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onStartAssessment}
              className="flex items-center justify-center space-x-2 bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onNavigateToSchedule}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <span>Schedule Workshop Instead</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Complete the assessment to receive your detailed digital readiness report and strategic recommendations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}