export function request(ctx) {
  const { assessmentInstanceId, responses } = ctx.arguments;
  
  return {
    version: '2018-05-29',
    payload: {
      assessmentInstanceId,
      responses
    }
  };
}

export function response(ctx) {
  const { assessmentInstanceId, responses } = ctx.payload;
  
  // Calculate score based on responses
  const score = calculateScore(responses);
  const bucketLabel = getBucketLabel(score);
  
  // Create score card
  const scoreCard = {
    id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assessmentInstanceId,
    overallScore: score,
    sectionScores: calculateSectionScores(responses),
    bucketLabel,
    explanations: generateExplanations(score),
    recommendations: generateRecommendations(score),
    pillarScores: calculatePillarScores(responses),
    dimensionScores: calculateDimensionScores(responses),
    maturityLevels: calculateMaturityLevels(responses),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return scoreCard;
}

function calculateScore(responses) {
  const weights = {
    'BASIC': 25,
    'EMERGING': 50,
    'ESTABLISHED': 75,
    'WORLD_CLASS': 100
  };
  
  const scores = Object.values(responses).map(response => {
    const answer = typeof response === 'string' ? response : response.value;
    return weights[answer] || 0;
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getBucketLabel(score) {
  if (score >= 85) return 'World Class';
  if (score >= 70) return 'Established';
  if (score >= 50) return 'Emerging';
  return 'Basic';
}

function calculateSectionScores(responses) {
  // Simplified section scoring - in real implementation, this would be more sophisticated
  return {
    digitalization: Math.floor(Math.random() * 40) + 60,
    transformation: Math.floor(Math.random() * 40) + 60,
    value_scaling: Math.floor(Math.random() * 40) + 60
  };
}

function generateExplanations(score) {
  if (score >= 85) {
    return 'Your organization demonstrates world-class digital maturity across most areas.';
  } else if (score >= 70) {
    return 'Your organization has established strong digital foundations with opportunities for optimization.';
  } else if (score >= 50) {
    return 'Your organization is emerging in digital maturity with clear areas for improvement.';
  } else {
    return 'Your organization is in the early stages of digital transformation with significant opportunities ahead.';
  }
}

function generateRecommendations(score) {
  if (score >= 85) {
    return [
      { title: 'Continue Innovation Leadership', priority: 'Medium' },
      { title: 'Share Best Practices', priority: 'Low' }
    ];
  } else if (score >= 70) {
    return [
      { title: 'Scale Digital Initiatives', priority: 'High' },
      { title: 'Strengthen Data Governance', priority: 'Medium' }
    ];
  } else if (score >= 50) {
    return [
      { title: 'Build Digital Infrastructure', priority: 'High' },
      { title: 'Develop Digital Skills', priority: 'High' }
    ];
  } else {
    return [
      { title: 'Start Digital Transformation', priority: 'Critical' },
      { title: 'Establish Data Standards', priority: 'High' }
    ];
  }
}

function calculatePillarScores(responses) {
  return {
    DIGITALIZATION: Math.floor(Math.random() * 40) + 60,
    TRANSFORMATION: Math.floor(Math.random() * 40) + 60,
    VALUE_SCALING: Math.floor(Math.random() * 40) + 60
  };
}

function calculateDimensionScores(responses) {
  return {
    DIG_DATA_FOUNDATION: Math.floor(Math.random() * 40) + 50,
    DIG_ELN: Math.floor(Math.random() * 40) + 60
  };
}

function calculateMaturityLevels(responses) {
  return {
    DIG_DATA_FOUNDATION: 'EMERGING',
    DIG_ELN: 'ESTABLISHED'
  };
}