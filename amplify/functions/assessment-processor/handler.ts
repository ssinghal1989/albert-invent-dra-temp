import type { Handler } from 'aws-lambda';

interface AssessmentEvent {
  responses: Record<string, string>;
  userId: string;
}

export const handler: Handler = async (event: AssessmentEvent) => {
  console.log('Assessment Processor Event:', JSON.stringify(event, null, 2));
  
  const { responses, userId } = event;
  
  try {
    // Calculate score based on responses
    const score = calculateScore(responses);
    
    // Store assessment result
    const result = {
      userId,
      score,
      responses,
      calculatedAt: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        score,
        maturityLevel: getMaturityLevel(score),
        recommendations: getRecommendations(score)
      })
    };
  } catch (error) {
    console.error('Error processing assessment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process assessment' })
    };
  }
};

function calculateScore(responses: Record<string, string>): number {
  const weights = {
    'Basic': 25,
    'Emerging': 50, 
    'Established': 75,
    'World Class': 100
  };
  
  const scores = Object.values(responses).map(level => weights[level as keyof typeof weights] || 0);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getMaturityLevel(score: number): string {
  if (score >= 85) return 'World Class';
  if (score >= 70) return 'Established';
  if (score >= 50) return 'Emerging';
  return 'Basic';
}

function getRecommendations(score: number): string[] {
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