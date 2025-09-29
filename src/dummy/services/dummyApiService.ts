// Dummy API service that mimics the real Amplify API service
import { dummyAssessmentTemplate, dummyPreviousAssessments } from '../data/assessmentTemplates';

// Simulate API delay with more realistic timing
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate score based on responses
const calculateScore = (responses: Record<string, string>): number => {
  const weights = {
    'BASIC': 25,
    'EMERGING': 50,
    'ESTABLISHED': 75,
    'WORLD_CLASS': 100
  };
  
  const scores = Object.values(responses).map(response => {
    const answer = typeof response === 'string' ? response : response;
    return weights[answer as keyof typeof weights] || 0;
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const getBucketLabel = (score: number): string => {
  if (score >= 85) return 'World Class';
  if (score >= 70) return 'Established';
  if (score >= 50) return 'Emerging';
  return 'Basic';
};

export const dummyApiService = {
  async getAssessmentTemplate(slug: string, version?: string) {
    await simulateDelay(1200); // Longer delay for template loading
    
    try {
      if (slug === 'digital-readiness-high') {
        return { success: true, data: dummyAssessmentTemplate };
      }
      return { success: false, error: 'Template not found' };
    } catch (error) {
      console.error('Get assessment template error:', error);
      return { success: false, error };
    }
  },

  async createAssessmentInstance(templateId: string, type: 'HIGH_LEVEL' | 'DETAILED', metadata?: any) {
    await simulateDelay(600);
    
    try {
      const instance = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        type,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        metadata
      };
      
      return { success: true, data: instance };
    } catch (error) {
      console.error('Create assessment instance error:', error);
      return { success: false, error };
    }
  },

  async submitAssessment(assessmentInstanceId: string, responses: Record<string, any>) {
    await simulateDelay(2000); // Longer delay for scoring calculation
    
    try {
      const score = calculateScore(responses);
      const bucketLabel = getBucketLabel(score);
      
      const scoreCard = {
        id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assessmentInstanceId,
        overallScore: score,
        sectionScores: {
          digitalization: Math.floor(Math.random() * 40) + 60,
          transformation: Math.floor(Math.random() * 40) + 60,
          value_scaling: Math.floor(Math.random() * 40) + 60
        },
        bucketLabel,
        explanations: `Your organization demonstrates ${bucketLabel.toLowerCase()} digital maturity.`,
        recommendations: generateRecommendations(score),
        pillarScores: {
          DIGITALIZATION: Math.floor(Math.random() * 40) + 60,
          TRANSFORMATION: Math.floor(Math.random() * 40) + 60,
          VALUE_SCALING: Math.floor(Math.random() * 40) + 60
        },
        createdAt: new Date().toISOString()
      };
      
      return { success: true, data: scoreCard };
    } catch (error) {
      console.error('Submit assessment error:', error);
      return { success: false, error };
    }
  },

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    companyId?: string;
  }) {
    await simulateDelay(1000); // User creation delay
    
    try {
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        companyId: userData.companyId,
        role: 'member',
        createdAt: new Date().toISOString()
      };
      
      return { success: true, data: user };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error };
    }
  },

  async createOrGetCompany(domain: string, name: string) {
    await simulateDelay(800);
    
    try {
      const company = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        primaryDomain: domain,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      
      return { success: true, data: company };
    } catch (error) {
      console.error('Create or get company error:', error);
      return { success: false, error };
    }
  },

  async recordConsent(userId: string, consentText: string, version: string) {
    await simulateDelay(400);
    
    try {
      const consent = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        consentText,
        version,
        accepted: true,
        acceptedAt: new Date().toISOString()
      };
      
      return { success: true, data: consent };
    } catch (error) {
      console.error('Record consent error:', error);
      return { success: false, error };
    }
  },

  async getUserAssessments(userId: string) {
    await simulateDelay(1000); // Loading previous assessments
    
    try {
      // Return dummy previous assessments for demo
      return { success: true, data: dummyPreviousAssessments };
    } catch (error) {
      console.error('Get user assessments error:', error);
      return { success: false, error };
    }
  },

  // Tier 2 specific methods
  async submitTier2Request(formData: any) {
    await simulateDelay(1500); // Scheduling request delay
    
    try {
      const request = {
        id: `tier2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString()
      };
      
      return { success: true, data: request };
    } catch (error) {
      console.error('Submit Tier 2 request error:', error);
      return { success: false, error };
    }
  }
};

function generateRecommendations(score: number) {
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