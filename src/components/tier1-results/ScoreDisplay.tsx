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
    <div className="flex justify-center mb-8 sm:mb-12">
      <div>
        <div className="relative">
          <svg 
            width="240" 
            height="240" 
            className="transform -rotate-90 sm:w-[280px] sm:h-[280px]" 
            viewBox="0 0 280 280"
          >
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="12"
              fill="none"
              className="sm:stroke-[16]"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={scoreColor}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out sm:stroke-[16]"
              style={{
                animation: "drawCircle 2s ease-out forwards",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-4xl sm:text-6xl font-bold"
              style={{ color: scoreColor }}
            >
              {score}
            </div>
            <div className="text-gray-500 text-base sm:text-lg font-medium mt-1">
              {maturityLevel}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">(Maturity Level)</div>
          </div>
        </div>
      </div>
    </div>
  );
}