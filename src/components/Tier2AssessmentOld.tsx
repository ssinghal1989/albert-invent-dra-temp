import React from 'react';
import { TrendingUp } from 'lucide-react';


export function Tier2AssessmentOld() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-none mx-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">Tier 2: In-Depth Assessment</h2>
            <p className="text-black">Comprehensive diagnostic workshop for strategic planning</p>
          </div>

          <div className="text-center">
            <p className="text-black mb-6">
              Coming soon
            </p>
            {/* <button 
              onClick={onShowLogin}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            >
              Complete Assessment
            </button> */}
          </div>
        </div>
      </div>
    </main>
  );
}