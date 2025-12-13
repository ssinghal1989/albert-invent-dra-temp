import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompanyScoreChartProps {
  overallScore: number;
  dimensionScores: {
    dimensionName: string;
    score: number;
    maxScore: number;
  }[];
}

export function CompanyScoreChart({ overallScore, dimensionScores }: CompanyScoreChartProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (percentage >= 40) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp className="w-5 h-5" />;
    if (percentage >= 40) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const overallPercentage = (overallScore / (dimensionScores.reduce((sum, d) => sum + d.maxScore, 0) || 1)) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Company Score</h3>

      <div className={`rounded-xl p-6 border-2 ${getScoreColor(overallPercentage)} mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">Aggregate Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{overallScore.toFixed(1)}</span>
              <span className="text-xl opacity-60">/ {dimensionScores.reduce((sum, d) => sum + d.maxScore, 0)}</span>
            </div>
            <p className="text-sm font-medium mt-1">{overallPercentage.toFixed(1)}%</p>
          </div>
          <div className="text-5xl opacity-20">
            {getTrendIcon(overallPercentage)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Dimension Breakdown</h4>
        {dimensionScores.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No dimension scores available</p>
        ) : (
          dimensionScores.map((dimension, index) => {
            const percentage = (dimension.score / dimension.maxScore) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{dimension.dimensionName}</span>
                  <span className="text-gray-600 font-semibold">
                    {dimension.score.toFixed(1)} / {dimension.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
