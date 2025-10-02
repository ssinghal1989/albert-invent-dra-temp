import React from 'react';
import { getScoreColor } from '../../utils/common';

interface ScoreDisplayProps {
  score: number;
  maturityLevel: string;
}

export function ScoreDisplay({ score, maturityLevel }: ScoreDisplayProps) {
  // Calculate circle properties for animated progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = getScoreColor(score);

  return (
    <div className="flex justify-center mb-12">
      <div>
        <div className="relative">
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={scoreColor}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                animation: "drawCircle 2s ease-out forwards",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-6xl font-bold"
              style={{ color: scoreColor }}
            >
              {score}
            </div>
            <div className="text-gray-500 text-lg font-medium mt-1">
              {maturityLevel}
            </div>
            <div className="text-gray-400 text-sm">(Maturity Level)</div>
          </div>
        </div>
      </div>
    </div>
  );
}