import React, { useState } from "react";
import { Tier2AssessmentInfo } from "./Tier2AssessmentInfo";
import { Tier2AssessmentQuestions } from "./Tier2AssessmentQuestions";
import { Tier2AssessmentSchedule } from "./Tier2AssessmentSchedule";

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: "tier1" | "tier2") => void;
}

type Tier2Step = "info" | "questions" | "schedule";

export function Tier2Assessment({ onNavigateToTier }: Tier2AssessmentProps) {
  const [currentStep, setCurrentStep] = useState<Tier2Step>("info");

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