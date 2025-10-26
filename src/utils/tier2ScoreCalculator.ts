// Tier 2 Assessment Score Calculator Utility
// Based on Full Readiness Matrix scoring system

export interface Tier2AssessmentResponses {
  [questionId: string]: string;
}

export interface Question {
  id: string;
  prompt: string;
  metadata?: {
    pillar?: string;
    dimension?: string;
  };
  options: Array<{
    value: string;
    score: number;
  }>;
}

export interface PillarRawScore {
  pillar: string;
  rawScore: number;
  maxRawScore: number;
  dimensionCount: number;
}

export interface Tier2ScoreResult {
  // Raw scores per pillar
  digitalizationRawScore: number;
  transformationRawScore: number;
  valueScalingRawScore: number;
  totalRawScore: number;

  // Weighted scores
  weightedScore: number;

  // Normalized scores (0-1 scale)
  normalizedScore: number;

  // Normalized shifted score (20-100 scale)
  normalizedShiftedScore: number;

  // Maturity level and scenario
  maturityLevel: string;
  scenarioSimulated: string;

  // Breakdown by pillar
  pillarScores: PillarRawScore[];

  // Total questions answered
  totalQuestions: number;
}

// Scoring configuration based on the image
const SCORING_CONFIG = {
  // Points per maturity level
  maturityToScore: {
    'BASIC': 1,
    'EMERGING': 2,
    'ESTABLISHED': 3,
    'WORLD_CLASS': 4
  },

  // Number of dimensions per pillar
  dimensionsPerPillar: {
    'DIGITALIZATION': 9,
    'TRANSFORMATION': 5,
    'VALUE_SCALING': 6
  },

  // Max raw scores per pillar (dimensions * 4 points max)
  maxRawScores: {
    'DIGITALIZATION': 36, // 9 * 4
    'TRANSFORMATION': 20, // 5 * 4
    'VALUE_SCALING': 24   // 6 * 4
  },

  // Weights for weighted raw score calculation
  weights: {
    w1: 0.4, // Digitalization
    w2: 0.3, // Transformation
    w3: 0.3  // Value Scaling
  },

  // Shift baseline configuration
  shiftBaseline: {
    noShift: 0,
    shifted: 20
  },

  // Normalization mapping (from image table)
  scoringTable: [
    { digitalization: 9, transformation: 5, valueScaling: 6, totalRaw: 20, weightedRaw: 0.25, normalized: 25, normalizedShifted: 40, scenario: 'Completely Basic' },
    { digitalization: 13, transformation: 8, valueScaling: 9, totalRaw: 30, weightedRaw: 0.38, normalized: 38, normalizedShifted: 50, scenario: 'Basic/Emerging' },
    { digitalization: 18, transformation: 10, valueScaling: 12, totalRaw: 40, weightedRaw: 0.50, normalized: 50, normalizedShifted: 60, scenario: 'Emerging' },
    { digitalization: 22, transformation: 13, valueScaling: 15, totalRaw: 50, weightedRaw: 0.63, normalized: 63, normalizedShifted: 70, scenario: 'Emerging/Established' },
    { digitalization: 27, transformation: 15, valueScaling: 18, totalRaw: 60, weightedRaw: 0.75, normalized: 75, normalizedShifted: 80, scenario: 'Established' },
    { digitalization: 31, transformation: 18, valueScaling: 21, totalRaw: 70, weightedRaw: 0.88, normalized: 88, normalizedShifted: 90, scenario: 'Established/World Class' },
    { digitalization: 36, transformation: 20, valueScaling: 24, totalRaw: 80, weightedRaw: 1.00, normalized: 100, normalizedShifted: 100, scenario: 'World Class' }
  ]
};

/**
 * Get the maturity level label based on normalized shifted score
 */
function getMaturityLevel(normalizedShiftedScore: number): string {
  if (normalizedShiftedScore >= 90) return 'World Class';
  if (normalizedShiftedScore >= 70) return 'Established';
  if (normalizedShiftedScore >= 50) return 'Emerging';
  return 'Basic';
}

/**
 * Get scenario simulated based on normalized shifted score
 */
function getScenarioSimulated(normalizedShiftedScore: number): string {
  if (normalizedShiftedScore >= 100) return 'World Class';
  if (normalizedShiftedScore >= 90) return 'Established/World Class';
  if (normalizedShiftedScore >= 80) return 'Established';
  if (normalizedShiftedScore >= 70) return 'Emerging/Established';
  if (normalizedShiftedScore >= 60) return 'Emerging';
  if (normalizedShiftedScore >= 50) return 'Basic/Emerging';
  return 'Completely Basic';
}

/**
 * Calculate Tier 2 assessment score based on Full Readiness Matrix methodology
 */
export function calculateTier2Score(
  responses: Tier2AssessmentResponses,
  questions: Question[]
): Tier2ScoreResult {
  const totalQuestions = Object.keys(responses).length;

  if (totalQuestions === 0) {
    return {
      digitalizationRawScore: 0,
      transformationRawScore: 0,
      valueScalingRawScore: 0,
      totalRawScore: 0,
      weightedScore: 0,
      normalizedScore: 0,
      normalizedShiftedScore: 20,
      maturityLevel: 'Basic',
      scenarioSimulated: 'Completely Basic',
      pillarScores: [],
      totalQuestions: 0
    };
  }

  // Initialize pillar scores
  const pillarData: { [pillar: string]: number } = {
    'DIGITALIZATION': 0,
    'TRANSFORMATION': 0,
    'VALUE_SCALING': 0
  };

  // Calculate raw scores for each pillar
  Object.entries(responses).forEach(([questionId, maturityLevel]) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const metadata = typeof question.metadata === 'string'
      ? JSON.parse(question.metadata)
      : question.metadata;

    const pillar = metadata?.pillar || 'UNKNOWN';
    const score = SCORING_CONFIG.maturityToScore[maturityLevel as keyof typeof SCORING_CONFIG.maturityToScore] || 0;

    if (pillarData[pillar] !== undefined) {
      pillarData[pillar] += score;
    }
  });

  const digitalizationRawScore = pillarData['DIGITALIZATION'];
  const transformationRawScore = pillarData['TRANSFORMATION'];
  const valueScalingRawScore = pillarData['VALUE_SCALING'];
  const totalRawScore = digitalizationRawScore + transformationRawScore + valueScalingRawScore;

  // Calculate weighted score using formula: S = w1 * (S1/S1_Max) + w2 * (S2/S2_Max) + w3 * (S3/S3_Max)
  const { w1, w2, w3 } = SCORING_CONFIG.weights;
  const { DIGITALIZATION: s1Max, TRANSFORMATION: s2Max, VALUE_SCALING: s3Max } = SCORING_CONFIG.maxRawScores;

  const weightedScore =
    w1 * (digitalizationRawScore / s1Max) +
    w2 * (transformationRawScore / s2Max) +
    w3 * (valueScalingRawScore / s3Max);

  // Calculate normalized score (0-1 scale mapped to 0-100)
  const normalizedScore = Math.round(weightedScore * 100);

  // Calculate normalized shifted score using formula: S_Norm = S_Base + (100-S_Base) * S
  const sBase = SCORING_CONFIG.shiftBaseline.shifted;
  const normalizedShiftedScore = Math.round(sBase + (100 - sBase) * weightedScore);

  // Determine maturity level and scenario
  const maturityLevel = getMaturityLevel(normalizedShiftedScore);
  const scenarioSimulated = getScenarioSimulated(normalizedShiftedScore);

  // Prepare pillar scores breakdown
  const pillarScores: PillarRawScore[] = [
    {
      pillar: 'DIGITALIZATION',
      rawScore: digitalizationRawScore,
      maxRawScore: s1Max,
      dimensionCount: SCORING_CONFIG.dimensionsPerPillar.DIGITALIZATION
    },
    {
      pillar: 'TRANSFORMATION',
      rawScore: transformationRawScore,
      maxRawScore: s2Max,
      dimensionCount: SCORING_CONFIG.dimensionsPerPillar.TRANSFORMATION
    },
    {
      pillar: 'VALUE_SCALING',
      rawScore: valueScalingRawScore,
      maxRawScore: s3Max,
      dimensionCount: SCORING_CONFIG.dimensionsPerPillar.VALUE_SCALING
    }
  ];

  return {
    digitalizationRawScore,
    transformationRawScore,
    valueScalingRawScore,
    totalRawScore,
    weightedScore,
    normalizedScore,
    normalizedShiftedScore,
    maturityLevel,
    scenarioSimulated,
    pillarScores,
    totalQuestions
  };
}

/**
 * Get recommendations based on pillar scores
 */
export function getTier2Recommendations(scoreResult: Tier2ScoreResult): string[] {
  const recommendations: string[] = [];
  const { pillarScores, normalizedShiftedScore } = scoreResult;

  // Find weakest pillars
  const sortedPillars = [...pillarScores].sort((a, b) => {
    const aPercentage = (a.rawScore / a.maxRawScore) * 100;
    const bPercentage = (b.rawScore / b.maxRawScore) * 100;
    return aPercentage - bPercentage;
  });

  const weakestPillar = sortedPillars[0];
  const weakestPercentage = (weakestPillar.rawScore / weakestPillar.maxRawScore) * 100;

  // Overall recommendations based on maturity level
  if (normalizedShiftedScore >= 90) {
    recommendations.push('Excellent progress! Focus on maintaining excellence and sharing best practices.');
    recommendations.push('Consider becoming a thought leader in digital transformation.');
    recommendations.push('Explore cutting-edge technologies and innovation opportunities.');
  } else if (normalizedShiftedScore >= 70) {
    recommendations.push('Strong foundation established. Focus on scaling and optimization.');
    recommendations.push('Invest in advanced capabilities and cross-functional integration.');
    recommendations.push('Build centers of excellence for knowledge sharing.');
  } else if (normalizedShiftedScore >= 50) {
    recommendations.push('Good progress on digital journey. Prioritize foundational improvements.');
    recommendations.push('Strengthen data governance and digital literacy programs.');
    recommendations.push('Focus on quick wins to build momentum.');
  } else {
    recommendations.push('Begin with fundamentals: data standards, basic automation, and digital culture.');
    recommendations.push('Secure executive sponsorship and establish clear digital vision.');
    recommendations.push('Start with pilot projects to demonstrate value.');
  }

  // Pillar-specific recommendations
  if (weakestPercentage < 50) {
    const pillarName = weakestPillar.pillar.toLowerCase().replace('_', ' ');
    recommendations.push(`Priority focus area: Strengthen ${pillarName} capabilities.`);
  }

  return recommendations;
}
