import {
    ArrowRight,
    Award,
    BarChart3,
    Clock,
    Database,
    TrendingUp,
    TrendingUp as TrendingUpIcon,
    Users
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
              The Tier 2 Assessment is performed across 3 pillars, each with multiple subdimensions to evaluate where you are in your digital transformation journey.
            </p>
          </div>

          {/* Three Pillars Section */}
          <div className="mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Pillar 1: Digitalization */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-300 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-600 text-sm font-medium uppercase tracking-wide">Pillar 1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Digitalization
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Data Management</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Data Foundation</li>
                      <li>• FAIR Data</li>
                      <li>• Governance and Stewardship</li>
                      <li>• Cybersecurity</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Digitalized R&D Execution</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Physical-to-Digital Identification Systems</li>
                      <li>• Digital Workflows</li>
                      <li>• Smart Lab</li>
                      <li>• Centralized R&D Analytics and Dashboards</li>
                      <li>• AI/ML</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Transformation */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-300 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-600 text-sm font-medium uppercase tracking-wide">Pillar 2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Transformation
                  </h3>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Digital Culture and Change Leadership</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Executive Sponsorship</li>
                    <li>• Digital Literacy</li>
                    <li>• Collaborative Digital Mindset</li>
                    <li>• Knowledge Management</li>
                    <li>• Change Management</li>
                  </ul>
                </div>
              </div>

              {/* Pillar 3: Value Scaling */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-300 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUpIcon className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-600 text-sm font-medium uppercase tracking-wide">Pillar 3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Value Scaling
                  </h3>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Connected Value Chain</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Market and Product Insights Integration</li>
                    <li>• Sustainability and Compliance by Design</li>
                    <li>• Supplier and Procurement Integration</li>
                    <li>• Customer-Centric Digitalization</li>
                    <li>• Manufacturing and Operations 4.0 Enablement</li>
                    <li>• External Partnerships, Digital Ecosystem</li>
                  </ul>
                </div>
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
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Outcome</h4>
                  <p className="text-gray-600 text-sm">Detailed Report</p>
                  <p className="text-gray-500 text-xs">With strategic recommendations</p>
                </div>
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

            {/* <button
              onClick={onNavigateToSchedule}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <span>Schedule Workshop Instead</span>
            </button> */}
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