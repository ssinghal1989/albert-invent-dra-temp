// Dummy seed service that mimics real database seeding operations
import { TIER1_DEFAULT_QUESTIONS, TIER2_DEFAULT_QUESTIONS, DEFAULT_ASSESSMENT_TEMPLATES } from '../data/defaultQuestions';
import { dummyQuestionsService } from './dummyQuestionsService';

// Simulate API delay
const simulateDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for seeded data tracking
let seedingStatus = {
  tier1Initialized: false,
  tier2Initialized: false,
  templatesCreated: false,
  lastSeeded: null as string | null
};

export const dummySeedService = {
  // Initialize default questions for both tiers
  async initializeDefaultQuestions() {
    await simulateDelay(2000); // Longer delay for initialization
    
    try {
      console.log('🌱 Initializing default questions...');
      
      let results = {
        tier1Created: 0,
        tier2Created: 0,
        templatesCreated: 0,
        skipped: 0
      };
      
      // STEP 1: Create templates first (this is automatic)
      const templatesResult = await this.createDefaultTemplates();
      if (templatesResult.success) {
        results.templatesCreated = templatesResult.data?.created || 0;
      }
      
      // Initialize TIER1 questions if not already done
      if (!seedingStatus.tier1Initialized) {
        console.log('📝 Creating TIER1 default questions...');
        const tier1Result = await dummyQuestionsService.bulkSaveQuestions(TIER1_DEFAULT_QUESTIONS);
        if (tier1Result.success) {
          results.tier1Created = tier1Result.data.length;
          seedingStatus.tier1Initialized = true;
        }
      } else {
        console.log('⏭️ TIER1 questions already initialized, skipping...');
        results.skipped += TIER1_DEFAULT_QUESTIONS.length;
      }
      
      // Initialize TIER2 questions if not already done
      if (!seedingStatus.tier2Initialized) {
        console.log('📝 Creating TIER2 default questions...');
        const tier2Result = await dummyQuestionsService.bulkSaveQuestions(TIER2_DEFAULT_QUESTIONS);
        if (tier2Result.success) {
          results.tier2Created = tier2Result.data.length;
          seedingStatus.tier2Initialized = true;
        }
      } else {
        console.log('⏭️ TIER2 questions already initialized, skipping...');
        results.skipped += TIER2_DEFAULT_QUESTIONS.length;
      }
      
      seedingStatus.lastSeeded = new Date().toISOString();
      
      console.log('✅ Default questions initialization completed:', results);
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Failed to initialize default questions:', error);
      return { success: false, error };
    }
  },

  // Create default assessment templates
  async createDefaultTemplates() {
    await simulateDelay(1000);
    
    try {
      let created = 0;
      
      if (!seedingStatus.templatesCreated) {
        console.log('🏗️ Creating default assessment templates...');
        
        for (const template of DEFAULT_ASSESSMENT_TEMPLATES) {
          console.log(`📋 Creating template: ${template.name}`);
          created++;
        }
        
        seedingStatus.templatesCreated = true;
        console.log(`✅ Created ${created} assessment templates`);
      } else {
        console.log('⏭️ Templates already created, skipping...');
      }
      
      return { success: true, data: { created } };
    } catch (error) {
      console.error('❌ Failed to create default templates:', error);
      return { success: false, error };
    }
  },

  // Reset questions to defaults
  async resetToDefaults(tier: 'TIER1' | 'TIER2' | 'BOTH' = 'BOTH') {
    await simulateDelay(2500); // Longer delay for reset operation
    
    try {
      console.log(`🔄 Resetting ${tier} questions to defaults...`);
      
      let results = {
        tier1Reset: 0,
        tier2Reset: 0,
        deleted: 0
      };
      
      if (tier === 'TIER1' || tier === 'BOTH') {
        console.log('🗑️ Clearing existing TIER1 questions...');
        // Simulate deletion of existing questions
        results.deleted += 10; // Assume 10 existing questions
        
        console.log('📝 Creating new TIER1 questions...');
        const tier1Result = await dummyQuestionsService.bulkSaveQuestions(TIER1_DEFAULT_QUESTIONS);
        if (tier1Result.success) {
          results.tier1Reset = tier1Result.data.length;
        }
        seedingStatus.tier1Initialized = true;
      }
      
      if (tier === 'TIER2' || tier === 'BOTH') {
        console.log('🗑️ Clearing existing TIER2 questions...');
        // Simulate deletion of existing questions
        results.deleted += 8; // Assume 8 existing questions
        
        console.log('📝 Creating new TIER2 questions...');
        const tier2Result = await dummyQuestionsService.bulkSaveQuestions(TIER2_DEFAULT_QUESTIONS);
        if (tier2Result.success) {
          results.tier2Reset = tier2Result.data.length;
        }
        seedingStatus.tier2Initialized = true;
      }
      
      seedingStatus.lastSeeded = new Date().toISOString();
      
      console.log('✅ Reset to defaults completed:', results);
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Failed to reset to defaults:', error);
      return { success: false, error };
    }
  },

  // Get current question counts
  async getQuestionCounts() {
    await simulateDelay(500);
    
    try {
      // Simulate getting counts from database
      const counts = {
        tier1: seedingStatus.tier1Initialized ? TIER1_DEFAULT_QUESTIONS.length : 0,
        tier2: seedingStatus.tier2Initialized ? TIER2_DEFAULT_QUESTIONS.length : 0,
        total: 0
      };
      
      counts.total = counts.tier1 + counts.tier2;
      
      return {
        success: true,
        data: counts
      };
    } catch (error) {
      console.error('❌ Failed to get question counts:', error);
      return { success: false, error };
    }
  },

  // Get seeding status
  async getSeedingStatus() {
    await simulateDelay(200);
    
    return {
      success: true,
      data: {
        ...seedingStatus,
        tier1QuestionCount: TIER1_DEFAULT_QUESTIONS.length,
        tier2QuestionCount: TIER2_DEFAULT_QUESTIONS.length,
        totalDefaultQuestions: TIER1_DEFAULT_QUESTIONS.length + TIER2_DEFAULT_QUESTIONS.length
      }
    };
  },

  // Force reset seeding status (for testing)
  async resetSeedingStatus() {
    seedingStatus = {
      tier1Initialized: false,
      tier2Initialized: false,
      templatesCreated: false,
      lastSeeded: null
    };
    
    return { success: true, data: seedingStatus };
  }
};