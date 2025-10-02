import React from 'react';
import { getScoreColor } from '../../utils/common';

interface AssessmentSummaryProps {
  score: number;
  maturityLevel: string;
}

export function AssessmentSummary({ score, maturityLevel }: AssessmentSummaryProps) {
  const scoreColor = getScoreColor(score);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Assessment Summary
      </h2>
      <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700 font-medium">
            Digital Readiness Level
          </span>
          <span
            className="font-bold text-xl"
            style={{ color: scoreColor }}
          >
            {maturityLevel}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
        <div className="relative text-sm text-gray-500 mt-2">
          <span
            className="absolute text-xs"
            style={{ left: "12.5%", transform: "translateX(-50%)" }}
          >
            Basic
          </span>
          <span
            className="absolute text-xs"
            style={{ left: "37.5%", transform: "translateX(-50%)" }}
          >
            Emerging
          </span>
          <span
            className="absolute text-xs"
            style={{ left: "62.5%", transform: "translateX(-50%)" }}
          >
            Established
          </span>
          <span
            className="absolute text-xs whitespace-nowrap"
            style={{ left: "87.5%", transform: "translateX(-50%)" }}
          >
            World Class
          </span>
        </div>
      </div>
    </div>
  );
}