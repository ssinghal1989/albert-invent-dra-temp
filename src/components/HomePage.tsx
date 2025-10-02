import React from 'react';
import { CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
}

export function HomePage({ onNavigateToTier }: HomePageProps) {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">              
          <p className="text-black text-md leading-relaxed">
            Welcome to the Albert Invent Digital Readiness Assessment, a strategic diagnostic that evaluates your R&D organization's maturity across digital infrastructure, culture, and value delivery. This assessment provides insight into where to focus investment to accelerate innovation, improve agility, and strengthen competitive advantage. The assessment is offered in two tiers, as described in the cards below.
          </p>
          <br/>
          <p className="text-black text-md leading-relaxed">
            Take the assessment, then sign up to get your results.
          </p>
        </div>

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Tier 1 Card */}
          <div className="bg-light rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-wide text-primary">TIER 1</div>
                <h3 className="text-xl font-bold text-black">High-Level Assessment</h3>
              </div>
            </div>

            <p className="text-black mb-6 font-medium">
              An actionable first step toward digital alignment
            </p>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Create alignment across teams and functions</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Establish shared language around digital maturity</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Identify early strengths, gaps, and opportunities</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTier('tier1')}
              className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-md hover:opacity-90"
            >
              <span>Start High-Level Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Tier 2 Card */}
          <div className="bg-light rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-wide text-primary">TIER 2</div>
                <h3 className="text-xl font-bold text-black">In-Depth Assessment</h3>
              </div>
            </div>

            <p className="text-black mb-6 font-medium">
              A detailed diagnostic workshop to guide decisions
            </p>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Evaluate maturity across teams, functions, or sites</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Prioritize initiatives and investment based on readiness</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-black">Define a clear roadmap with focus areas and actions</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTier('tier2')}
              className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-md hover:opacity-90"
            >
              <span>Request In-Depth Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}