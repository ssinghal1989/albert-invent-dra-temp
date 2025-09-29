// Tier 1 Assessment Score Calculator Utility

export interface AssessmentResponses {
  [questionId: string]: string;
}

export interface ScoreResult {
  overallScore: number;
  totalQuestions: number;
  scoreBreakdown: {
    basic: number;
    emerging: number;
    established: number;
    worldClass: number;
  };
  maturityLevel: string;
}

// Maturity level to score mapping
const MATURITY_SCORES = {
  'BASIC': 25,
  'EMERGING': 50,
  'ESTABLISHED': 75,
  'WORLD_CLASS': 100
} as const;

// Maturity level labels
const MATURITY_LEVELS = {
  'BASIC': 'Basic',
  'EMERGING': 'Emerging', 
  'ESTABLISHED': 'Established',
  'WORLD_CLASS': 'World Class'
} as const;

/**
 * Calculate the overall score for Tier 1 assessment
 * @param responses - Object with questionId as key and maturity level as value
 * @returns ScoreResult with overall score and breakdown
 */
export function calculateTier1Score(responses: AssessmentResponses): ScoreResult {
  const questionIds = Object.keys(responses);
  const totalQuestions = questionIds.length;
  
  if (totalQuestions === 0) {
    return {
      overallScore: 0,
      totalQuestions: 0,
      scoreBreakdown: {
        basic: 0,
        emerging: 0,
        established: 0,
        worldClass: 0
      },
      maturityLevel: 'Basic'
    };
  }

  // Count responses by maturity level
  const scoreBreakdown = {
    basic: 0,
    emerging: 0,
    established: 0,
    worldClass: 0
  };

  // Calculate total score
  let totalScore = 0;
  
  questionIds.forEach(questionId => {
    const maturityLevel = responses[questionId].toUpperCase();
    const score = MATURITY_SCORES[maturityLevel as keyof typeof MATURITY_SCORES] || 0;
    
    totalScore += score;
    
    // Update breakdown counts
    switch (maturityLevel) {
      case 'BASIC':
        scoreBreakdown.basic++;
        break;
      case 'EMERGING':
        scoreBreakdown.emerging++;
        break;
      case 'ESTABLISHED':
        scoreBreakdown.established++;
        break;
      case 'WORLD_CLASS':
        scoreBreakdown.worldClass++;
        break;
    }
  });

  // Calculate average score (overall score)
  const overallScore = Math.round(totalScore / totalQuestions);
  
  // Determine maturity level based on overall score
  const maturityLevel = getMaturityLevel(overallScore);

  return {
    overallScore,
    totalQuestions,
    scoreBreakdown,
    maturityLevel
  };
}

/**
 * Get maturity level label based on overall score
 * @param score - Overall score (0-100)
 * @returns Maturity level label
 */
export function getMaturityLevel(score: number): string {
  if (score >= 85) return 'World Class';
  if (score >= 70) return 'Established';
  if (score >= 50) return 'Emerging';
  return 'Basic';
}

/**
 * Get score color based on overall score
 * @param score - Overall score (0-100)
 * @returns CSS color value
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return '#05f'; // primary
  if (score >= 70) return '#088aff'; // accent
  if (score >= 50) return '#374151'; // secondary
  return '#6b7280'; // gray-500
}

/**
 * Get recommendations based on overall score
 * @param score - Overall score (0-100)
 * @returns Array of recommendation strings
 */
export function getRecommendations(score: number): string[] {
  if (score >= 85) {
    return [
      'Continue to innovate and lead in digital transformation',
      'Share best practices across the organization',
      'Explore advanced AI and automation opportunities'
    ];
  }
  if (score >= 70) {
    return [
      'Focus on scaling successful digital initiatives',
      'Strengthen data governance and integration',
      'Invest in advanced analytics capabilities'
    ];
  }
  if (score >= 50) {
    return [
      'Prioritize foundational digital infrastructure',
      'Develop digital skills across teams',
      'Establish clear data governance frameworks'
    ];
  }
  return [
    'Begin with basic digital transformation initiatives',
    'Focus on data standardization and integration',
    'Build digital culture and leadership support'
  ];
}

/**
 * Example usage with your provided data
 */
export function exampleCalculation() {
  const sampleResponses: AssessmentResponses = {
    "5c8e0f14-1f9d-4042-a8ea-9cb0932ecdc6": "EMERGING",
    "5d49ff21-bcb0-4d4a-8269-78894e611caa": "EMERGING", 
    "65a2e2a5-4e3f-4bfb-96f6-c9fb24804f18": "EMERGING",
    "750e140d-4a80-4dff-80c4-055f5e64c192": "EMERGING",
    "9295f357-4649-4a88-8cf3-461135aed85a": "EMERGING",
    "84194c59-68ae-44b6-a6c7-12ffc96695d3": "EMERGING",
    "314106a4-880c-4235-8ded-65ad01dcb5dd": "BASIC",
    "b5a3265c-1e80-4b89-b0f0-a2a0369d8971": "ESTABLISHED",
    "e080ed2f-ac37-4b69-87fd-1aa1e68820a0": "EMERGING",
    "efe1dcd4-7834-4540-81b2-0ff9011fab45": "EMERGING"
  };

  const result = calculateTier1Score(sampleResponses);
  
  console.log('Sample Calculation Result:', result);
  // Expected result:
  // - 8 EMERGING responses (50 points each) = 400 points
  // - 1 BASIC response (25 points) = 25 points  
  // - 1 ESTABLISHED response (75 points) = 75 points
  // - Total: 500 points / 10 questions = 50 average score
  // - Maturity Level: "Emerging"
  
  return result;
}