import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Tier2AssessmentSchedule } from "./Tier2AssessmentSchedule";

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: "tier1" | "tier2") => void;
}

export function Tier2Assessment({ onNavigateToTier }: Tier2AssessmentProps) {
  const { state } = useAppContext();

  const handleBackToInfo = () => {
    onNavigateToTier("tier1");
  };

  // Always show the schedule flow for Tier 2
  return <Tier2AssessmentSchedule onBack={handleBackToInfo} />;
}
