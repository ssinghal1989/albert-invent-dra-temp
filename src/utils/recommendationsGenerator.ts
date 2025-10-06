// Recommendations Generator based on Pillar Scoring
import { Tier1ScoreResult } from './scoreCalculator';

// Enhanced recommendation interface with metadata
export interface RecommendationWithMetadata {
  text: string;
  pillar?: string;
  maturityLevel?: string;
  focusArea?: string;
  isPriority?: boolean;
}

// Priority sentences based on lowest-scoring pillar
const PRIORITY_SENTENCES = {
  DIGITALIZATION: "Since your data is still siloed and core systems aren't integrated, start by improving your data foundation and lab digitalization workflows.",
  TRANSFORMATION: "A shared digital vision and empowered digital workforce are critical—focus on leadership alignment and skills development.",
  VALUE_SCALING: "You've made progress in digital infrastructure—now extend that by improving feedback loops, sustainability, and supplier connectivity. Don't forget to continue expanding on your data foundation and bolstering digital culture in your organization!"
};

// Pillar mapping for color coding
const PILLAR_INFO = {
  DIGITALIZATION: { name: 'Digitalization', color: '#3b82f6' }, // blue
  TRANSFORMATION: { name: 'Transformation', color: '#10b981' }, // emerald
  VALUE_SCALING: { name: 'Value Scaling', color: '#f59e0b' } // amber
};

// Maturity level colors
const MATURITY_COLORS = {
  BASIC: '#ef4444', // red
  EMERGING: '#f59e0b', // amber
  ESTABLISHED: '#3b82f6', // blue
  WORLD_CLASS: '#10b981' // emerald
};

// Focus area recommendations by maturity level
const FOCUS_AREA_RECOMMENDATIONS = {
  // Digitalization Pillar
  'Data Architecture and Integration': {
    BASIC: "Focus on building your data architecture and integrations to improve your data foundation.",
    EMERGING: "Standardize data formats and connect critical systems across R&D.",
    ESTABLISHED: "Expand unified data models and automate cross-system data flows.",
    WORLD_CLASS: "Use your interoperable architecture to drive real-time insights and scale innovation initiatives."
  },
  'Data Governance and Trust': {
    BASIC: "Define clear data ownership and quality processes to make data more reliable and accessible.",
    EMERGING: "Launch pilot governance efforts with validated metadata standards.",
    ESTABLISHED: "Institutionalize FAIR data principles and data lifecycle management.",
    WORLD_CLASS: "Continuously improve trust in data with automated validation and governance at scale."
  },
  'Supplier Ecosystem Connectivity': {
    BASIC: "Replace email-based exchanges with shared templates or digital specs.",
    EMERGING: "Pilot supplier portals for key suppliers.",
    ESTABLISHED: "Build traceability through real-time digital supplier integrations.",
    WORLD_CLASS: "Create secure, seamless digital ecosystems with full upstream/downstream connectivity."
  },

  // Transformation Pillar
  'Smart Lab and Workflow Automation': {
    BASIC: "Digitize manual records, and digitalize operations to reduce reliance on paper-based processes.",
    EMERGING: "Integrate lab instruments for data capture and expand ELN usage.",
    ESTABLISHED: "Automate data capture and orchestrate workflows across systems.",
    WORLD_CLASS: "Expand to fully connected smart labs with autonomous workflows and robotic systems."
  },
  'Manufacturing and Scale-up Integration': {
    BASIC: "Reduce manual tech transfer for scale up and document handoffs by digitalizing process data.",
    EMERGING: "Implement basic digital transfer templates and standardized formats for scale-up.",
    ESTABLISHED: "Strengthen collaboration through digital twins and shared production views.",
    WORLD_CLASS: "Use live manufacturing feedback to optimize R&D processes in real time."
  },
  'Leadership and Digital Culture': {
    BASIC: "Begin by defining a clear digital vision and building alignment among leadership.",
    EMERGING: "Identify and support digital champions to promote early wins.",
    ESTABLISHED: "Cascade the digital vision across the org and embed it in strategy.",
    WORLD_CLASS: "Empower leaders to model digital behaviors and cultivate a strong, innovation-driven culture."
  },
  'Skills and Workforce Enablement': {
    BASIC: "Assess current digital skills and define upskilling priorities.",
    EMERGING: "Roll out targeted training programs and tool adoption support.",
    ESTABLISHED: "Expand access to continuous learning platforms and mentorship.",
    WORLD_CLASS: "Institutionalize digital fluency and create career pathways for digital roles."
  },

  // Value Scaling Pillar
  'Analytics and AI-driven Discovery': {
    BASIC: "Shift from manual reporting to descriptive dashboards.",
    EMERGING: "Enable self-service analytics and start experimenting with predictive models.",
    ESTABLISHED: "Embed analytics in day-to-day workflows and refine predictive insights.",
    WORLD_CLASS: "Scale AI/ML for prescriptive insights that drive decision-making across R&D."
  },
  'Customer and Market Feedback Integration': {
    BASIC: "Create simple mechanisms to capture customer insights post-launch.",
    EMERGING: "Standardize Voice of Customer (VOC) processes for key initiatives and products.",
    ESTABLISHED: "Use structured feedback to drive product design and iteration.",
    WORLD_CLASS: "Incorporate real-time customer input into innovation loops across R&D."
  },
  'Sustainability and Regulatory Intelligence': {
    BASIC: "Start tracking sustainability metrics and regulatory changes manually.",
    EMERGING: "Link post-development impact metrics back to project teams.",
    ESTABLISHED: "Build early-stage sustainability into design tools and workflows.",
    WORLD_CLASS: "Simulate eco-impact and regulatory outcomes in real time during R&D."
  }
};

/**
 * Generate recommendations based on pillar scoring and focus area analysis
 * @param scoreResult - Complete score result with pillar and focus area data
 * @returns Array of recommendations with metadata
 */
export function generateRecommendations(scoreResult: Tier1ScoreResult): RecommendationWithMetadata[] {
  const recommendations: RecommendationWithMetadata[] = [];

  // 1. Check if lowest-scoring pillar is above "Emerging" level
  const lowestScoringPillarData = scoreResult.pillarScores.find(
    pillar => pillar.pillar === scoreResult.lowestScoringPillar
  );
  
  // Only add priority sentence if the lowest-scoring pillar is at "Emerging" level or below
  // Emerging = 50, so if average score is > 50, skip priority sentence
  const shouldShowPrioritySentence = lowestScoringPillarData && lowestScoringPillarData.averageScore <= 50;
  
  if (shouldShowPrioritySentence) {
    const prioritySentence = PRIORITY_SENTENCES[scoreResult.lowestScoringPillar as keyof typeof PRIORITY_SENTENCES];
    if (prioritySentence) {
      recommendations.push({
        text: prioritySentence,
        pillar: scoreResult.lowestScoringPillar,
        isPriority: true
      });
    }
  }

  // 2. Add focus area recommendations based on maturity levels
  scoreResult.focusAreaScores.forEach(focusArea => {
    const focusAreaKey = focusArea.focusArea;
    const maturityLevel = focusArea.maturityLevel;
    const pillar = focusArea.pillar;
    
    // Find matching recommendation
    const focusAreaRecs = FOCUS_AREA_RECOMMENDATIONS[focusAreaKey as keyof typeof FOCUS_AREA_RECOMMENDATIONS];
    if (focusAreaRecs) {
      const recommendation = focusAreaRecs[maturityLevel as keyof typeof focusAreaRecs];
      if (recommendation) {
        recommendations.push({
          text: recommendation,
          pillar: pillar,
          maturityLevel: maturityLevel,
          focusArea: focusAreaKey,
          isPriority: false
        });
      }
    }
  });

  return recommendations;
}

/**
 * Get color for a pillar
 * @param pillar - Pillar name
 * @returns Color hex code
 */
export function getPillarColor(pillar: string): string {
  return PILLAR_INFO[pillar as keyof typeof PILLAR_INFO]?.color || '#6b7280';
}

/**
 * Get color for a maturity level
 * @param maturityLevel - Maturity level
 * @returns Color hex code
 */
export function getMaturityColor(maturityLevel: string): string {
  return MATURITY_COLORS[maturityLevel as keyof typeof MATURITY_COLORS] || '#6b7280';
}

/**
 * Get pillar display name
 * @param pillar - Pillar name
 * @returns Display name
 */
export function getPillarName(pillar: string): string {
  return PILLAR_INFO[pillar as keyof typeof PILLAR_INFO]?.name || pillar;
}