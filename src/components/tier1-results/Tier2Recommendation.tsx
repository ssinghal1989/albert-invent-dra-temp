import React from 'react';
import { Tier1ScoreResult } from '../../utils/scoreCalculator';

interface Tier2RecommendationProps {
  scoreData: Tier1ScoreResult;
}

export function Tier2Recommendation({ scoreData }: Tier2RecommendationProps) {
  // Calculate lowest scoring areas for recommendations
  const getLowestScoringAreas = (scoreData: Tier1ScoreResult): string[] => {
    if (!scoreData.focusAreaScores || scoreData.focusAreaScores.length === 0) {
      return [];
    }

    // Priority order for tie-breaking
    const priorityOrder = [
      'Data Architecture and Integration',
      'Data Governance and Trust', 
      'Smart Lab and Workflow Automation',
      'Leadership and Digital Culture',
      'Analytics and AI-driven Discovery',
      'Manufacturing and Scale-up Integration',
      'Skills and Workforce Enablement',
      'Customer and Market Feedback Integration',
      'Sustainability and Regulatory Intelligence',
      'Supplier Ecosystem Connectivity'
    ];

    // Sort focus areas by score (lowest first), then by priority order for ties
    const sortedAreas = [...scoreData.focusAreaScores].sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score; // Lower scores first
      }
      // If scores are equal, use priority order
      const aIndex = priorityOrder.indexOf(a.focusArea);
      const bIndex = priorityOrder.indexOf(b.focusArea);
      return aIndex - bIndex;
    });

    // Return the 3 lowest scoring areas
    return sortedAreas.slice(0, 3).map(area => area.focusArea);
  };

  const lowestScoringAreas = getLowestScoringAreas(scoreData);

  return (
    <div className="mb-12">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
        <p className="text-blue-800 text-base font-medium mb-4">
          Your Tier 1 results show that the following Focus Areas stand out as key opportunities:
        </p>
        <ul className="text-blue-700 text-base mb-4 space-y-2">
          {lowestScoringAreas.map((area, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
        <p className="text-blue-800 text-base font-medium">
          We'd recommend a Tier 2 assessment to dive deeper into these dimensions and 
          uncover concrete opportunities to advance your digital transformation.
        </p>
      </div>
    </div>
  );
}