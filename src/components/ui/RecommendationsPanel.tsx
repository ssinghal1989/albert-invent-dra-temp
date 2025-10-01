import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { formatStringToTitle, getScoreColor } from '../../utils/common';
import {
  generateRecommendations,
  getMaturityColor,
  getPillarColor
} from '../../utils/recommendationsGenerator';
import { Tier1ScoreResult } from '../../utils/scoreCalculator';

interface RecommendationsPanelProps {
  scoreData: Tier1ScoreResult;
  className?: string;
  defaultExpanded?: boolean;
  showToggleButton?: boolean;
  maxRecommendations?: number;
}

export function RecommendationsPanel({
  scoreData,
  className = '',
  defaultExpanded = false,
  showToggleButton = true,
  maxRecommendations = 10
}: RecommendationsPanelProps) {
  const [showRecommendations, setShowRecommendations] = useState(defaultExpanded);

  const recommendations = scoreData?.pillarScores
    ? generateRecommendations(scoreData)
    : [];

  const scoreColor = getScoreColor(scoreData.overallScore);

 

  if (!showToggleButton && !defaultExpanded) {
    return null;
  }

  return (
    <div className={className}>
      {/* Toggle Button */}
      {showToggleButton && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-gray-700 font-medium">
              {showRecommendations ? 'Hide' : 'Show'} Recommendations
            </span>
            {showRecommendations ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      )}

      {/* Expandable Recommendations Panel */}
      {(showRecommendations || defaultExpanded) && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h4 className="text-lg font-semibold text-gray-900">
              Recommendations Based on Your Assessment
            </h4>
          </div>

          <div className="space-y-3">
            {/* Priority Recommendation */}
            {recommendations.length > 0 && (
              <div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4"
                style={{ 
                  borderColor: '#05f' 
                }}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ 
                      backgroundColor: scoreColor 
                    }}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">
                      Priority Focus ({formatStringToTitle(recommendations[0].pillar || '')})
                    </h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {recommendations[0].text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Recommendations */}
            {recommendations.length > 1 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">
                  Additional Focus Areas:
                </h5>
                <div className="grid gap-3">
                  {(() => {
                    const maturityOrder = ['BASIC', 'EMERGING', 'ESTABLISHED', 'WORLD_CLASS'];
                    const sortedRecommendations = recommendations
                      .slice(1)
                      .sort((a, b) => {
                        const aIndex = a.maturityLevel ? maturityOrder.indexOf(a.maturityLevel) : 999;
                        const bIndex = b.maturityLevel ? maturityOrder.indexOf(b.maturityLevel) : 999;
                        return aIndex - bIndex;
                      });
                    
                    return sortedRecommendations.map((recommendation, index) => {
                      const bgColor = recommendation.maturityLevel 
                        ? getMaturityColor(recommendation.maturityLevel) 
                        : (recommendation.pillar ? getPillarColor(recommendation.pillar) : scoreColor);
                      
                      return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: bgColor }}
                          >
                            <span className="text-white text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {recommendation.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    )});
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}