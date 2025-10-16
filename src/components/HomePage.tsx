import React from 'react';
import { CheckCircle, TrendingUp, ArrowRight, ExternalLink } from 'lucide-react';

interface HomePageProps {
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
}

export function HomePage({ onNavigateToTier }: HomePageProps) {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">              
          <p className="text-black text-sm sm:text-base leading-relaxed">
            Welcome to the Albert Invent Digital Readiness Assessment, a strategic diagnostic that evaluates your R&D organization's maturity across digital infrastructure, culture, and value delivery. This assessment provides insight into where to focus investment to accelerate innovation, improve agility, and strengthen competitive advantage. The assessment is offered in two tiers, as described in the cards below.
          </p>
          
          {/* Blog Post Link */}
          <div className="mt-4 sm:mt-6">
            <a
              href="https://hubs.li/Q03MBT0r0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary hover:text-blue-700 font-medium text-sm sm:text-base transition-colors duration-200 group"
            >
              <span>To learn more about the assessment, please read our blog.</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </a>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Tier 1 Card */}
          <div className="bg-light rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium uppercase tracking-wide text-primary">TIER 1</div>
                <h3 className="text-lg sm:text-xl font-bold text-black">High-Level Assessment</h3>
              </div>
            </div>

            <p className="text-black mb-4 sm:mb-6 font-medium text-sm sm:text-base">
              An actionable first step toward digital alignment
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Create alignment across teams and functions</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Establish shared language around digital maturity</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Identify early strengths, gaps, and opportunities</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTier('tier1')}
              className="w-full bg-primary text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-md hover:opacity-90 text-sm sm:text-base"
            >
              <span>Start High-Level Assessment</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Tier 2 Card */}
          <div className="bg-light rounded-2xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium uppercase tracking-wide text-primary">TIER 2</div>
                <h3 className="text-lg sm:text-xl font-bold text-black">In-Depth Assessment</h3>
              </div>
            </div>

            <p className="text-black mb-4 sm:mb-6 font-medium text-sm sm:text-base">
              A detailed diagnostic workshop to guide decisions
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Evaluate maturity across teams, functions, or sites</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Prioritize initiatives and investment based on readiness</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black text-sm sm:text-base">Define a clear roadmap with focus areas and actions</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTier('tier2')}
              className="w-full bg-primary text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-md hover:opacity-90 text-sm sm:text-base"
            >
              <span>Request In-Depth Assessment</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}