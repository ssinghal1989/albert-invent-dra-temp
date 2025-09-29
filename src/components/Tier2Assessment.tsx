import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Tier2AssessmentInfo } from "./Tier2AssessmentInfo";
import { Tier2AssessmentQuestions } from "./Tier2AssessmentQuestions";
import { Tier2AssessmentSchedule } from "./Tier2AssessmentSchedule";
import { Lock, Calendar } from "lucide-react";

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: "tier1" | "tier2") => void;
}

type Tier2Step = "info" | "questions" | "schedule";

export function Tier2Assessment({ onNavigateToTier }: Tier2AssessmentProps) {
  const { state } = useAppContext();
  const [currentStep, setCurrentStep] = useState<Tier2Step>("info");

  // Check if company has Tier2 access enabled
  const companyConfig = state.company?.config ? JSON.parse(state.company.config as string) : {};
  const hasTier2Access = companyConfig.tier2AccessEnabled === true;

  const handleStartAssessment = () => {
    setCurrentStep("questions");
  };

  const handleNavigateToSchedule = () => {
    setCurrentStep("schedule");
  };

  const handleBackToInfo = () => {
    setCurrentStep("info");
  };

  const handleAssessmentComplete = (responses: Record<string, string>) => {
    // Handle assessment completion - could navigate to results or schedule
    console.log("Assessment completed with responses:", responses);
    // For now, navigate back to tier selection
    onNavigateToTier("tier1");
  };

  // If user doesn't have Tier2 access, show access request screen
  if (!hasTier2Access) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tier 2 Assessment Access Required
            </h1>
            
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              The Tier 2 In-Depth Assessment is a premium offering that requires special access. 
              Please schedule a consultation call with our team to discuss your needs and get access enabled.
            </p>

            <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-gray-700 text-sm">Schedule a consultation call with our assessment team</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-gray-700 text-sm">Discuss your digital transformation goals and assessment needs</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-gray-700 text-sm">Get access enabled for your organization's Tier 2 Assessment</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep("schedule")}
              className="flex items-center justify-center space-x-2 bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 mx-auto"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Consultation Call</span>
            </button>

            <div className="mt-6">
              <button
                onClick={() => onNavigateToTier("tier1")}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                ← Back to Tier 1 Assessment
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Render current step
  switch (currentStep) {
    case "info":
      return (
        <Tier2AssessmentInfo
          onStartAssessment={handleStartAssessment}
          onNavigateToSchedule={handleNavigateToSchedule}
        />
      );
    
    case "questions":
      return (
        <Tier2AssessmentQuestions
          onComplete={handleAssessmentComplete}
          onBack={handleBackToInfo}
        />
      );
    
    case "schedule":
      return (
        <Tier2AssessmentSchedule
          onBack={handleBackToInfo}
        />
      );

    default:
      return null;
  }
}