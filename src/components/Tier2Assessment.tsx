import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Tier2AssessmentSchedule } from "./Tier2AssessmentSchedule";
// import { Tier2AssessmentInfo } from "./Tier2AssessmentInfo";
// import { Tier2AssessmentQuestions } from "./Tier2AssessmentQuestions";
// import { useHasTier2Access } from "../context/AppContext";

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: "tier1" | "tier2") => void;
}

export function Tier2Assessment({ onNavigateToTier }: Tier2AssessmentProps) {
  const { state } = useAppContext();
  // const [currentStep, setCurrentStep] = useState<"info" | "questions" | "schedule">("info");
  // const hasTier2Access = useHasTier2Access();

  const handleBackToInfo = () => {
    onNavigateToTier("tier1");
  };

  // const handleStartAssessment = () => {
  //   setCurrentStep("questions");
  // };

  // const handleNavigateToSchedule = () => {
  //   setCurrentStep("schedule");
  // };

  // const handleCompleteAssessment = (responses: Record<string, string>) => {
  //   // Handle Tier 2 assessment completion
  //   console.log("Tier 2 assessment completed:", responses);
  // };

  // Commented out for future use - Full Tier 2 Assessment Flow
  // if (!hasTier2Access) {
  //   return (
  //     <main className="flex-1 p-8">
  //       <div className="max-w-4xl mx-auto">
  //         <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
  //           <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
  //             <AlertCircle className="w-8 h-8 text-white" />
  //           </div>
  //           <h1 className="text-3xl font-bold text-gray-900 mb-4">
  //             Access Required
  //           </h1>
  //           <p className="text-gray-600 text-lg mb-8">
  //             Tier 2 assessment access has not been enabled for your organization.
  //           </p>
  //           <button
  //             onClick={() => onNavigateToTier("tier1")}
  //             className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
  //           >
  //             Back to Tier 1
  //           </button>
  //         </div>
  //       </div>
  //     </main>
  //   );
  // }

  // switch (currentStep) {
  //   case "info":
  //     return (
  //       <Tier2AssessmentInfo
  //         onStartAssessment={handleStartAssessment}
  //         onNavigateToSchedule={handleNavigateToSchedule}
  //       />
  //     );
  //   case "questions":
  //     return (
  //       <Tier2AssessmentQuestions
  //         onComplete={handleCompleteAssessment}
  //         onBack={() => setCurrentStep("info")}
  //       />
  //     );
  //   case "schedule":
  //     return (
  //       <Tier2AssessmentSchedule onBack={() => setCurrentStep("info")} />
  //     );
  //   default:
  //     return (
  //       <Tier2AssessmentInfo
  //         onStartAssessment={handleStartAssessment}
  //         onNavigateToSchedule={handleNavigateToSchedule}
  //       />
  //     );
  // }
  // Always show the schedule flow for Tier 2
  return <Tier2AssessmentSchedule onBack={handleBackToInfo} />;
}
