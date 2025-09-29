// Seed data service for initializing default questions
import { questionsService } from './questionsService';
import { apiService } from './amplifyService';
import { TIER1_DEFAULT_QUESTIONS, TIER2_DEFAULT_QUESTIONS, DEFAULT_ASSESSMENT_TEMPLATES } from '../dummy/data/defaultQuestions';

// DUMMY DATA: Mock seed service
import { dummySeedService } from '../dummy/services/dummySeedService';

// Flag to determine if we should use dummy data (when Amplify is not configured)
const USE_DUMMY_DATA = true; // Set to false when using real Amplify

export const seedDataService = {
  // Initialize default questions for both tiers
  async initializeDefaultQuestions() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummySeedService.initializeDefaultQuestions();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      console.log('Initializing default questions...');
      
      // STEP 1: Create assessment templates if they don't exist
      await this.createDefaultTemplates();
      
      // STEP 2: Check if questions already exist
      const existingTier1 = await questionsService.getQuestionsByTemplate('tpl_tier1_digital_readiness');
      const existingTier2 = await questionsService.getQuestionsByTemplate('tpl_tier2_detailed_assessment');
      
      let results = {
        tier1Created: 0,
        tier2Created: 0,
        templatesCreated: 0
      };
      
      // Create TIER1 questions if they don't exist
      if (!existingTier1.success || existingTier1.data.length === 0) {
        console.log('Creating TIER1 default questions...');
        const tier1Result = await questionsService.bulkSaveQuestions(TIER1_DEFAULT_QUESTIONS);
        if (tier1Result.success) {
          results.tier1Created = tier1Result.data.length;
        }
      }
      
      // Create TIER2 questions if they don't exist
      if (!existingTier2.success || existingTier2.data.length === 0) {
        console.log('Creating TIER2 default questions...');
        const tier2Result = await questionsService.bulkSaveQuestions(TIER2_DEFAULT_QUESTIONS);
        if (tier2Result.success) {
          results.tier2Created = tier2Result.data.length;
        }
      }
      
      console.log('Default questions initialization completed:', results);
      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to initialize default questions:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummySeedService.initializeDefaultQuestions();
  },

  // Create default assessment templates
  async createDefaultTemplates() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummySeedService.createDefaultTemplates();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      for (const template of DEFAULT_ASSESSMENT_TEMPLATES) {
        // Check if template already exists
        const existing = await apiService.getAssessmentTemplate(template.slug);
        
        if (!existing.success || !existing.data) {
          // Create new template
          const result = await apiService.createAssessmentTemplate(template);
          if (result.success) {
            console.log(`Created assessment template: ${template.name}`);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to create default templates:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummySeedService.createDefaultTemplates();
  },

  // Reset questions to defaults (useful for admin)
  async resetToDefaults(tier: 'TIER1' | 'TIER2' | 'BOTH' = 'BOTH') {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummySeedService.resetToDefaults(tier);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      console.log(`Resetting ${tier} questions to defaults...`);
      
      let results = {
        tier1Reset: 0,
        tier2Reset: 0,
        deleted: 0
      };
      
      if (tier === 'TIER1' || tier === 'BOTH') {
        // Delete existing TIER1 questions
        const existing = await questionsService.getQuestionsByTemplate('tpl_tier1_digital_readiness');
        if (existing.success && existing.data) {
          for (const question of existing.data) {
            await questionsService.deleteQuestion(question.id);
            results.deleted++;
          }
        }
        
        // Create new TIER1 questions
        const tier1Result = await questionsService.bulkSaveQuestions(TIER1_DEFAULT_QUESTIONS);
        if (tier1Result.success) {
          results.tier1Reset = tier1Result.data.length;
        }
      }
      
      if (tier === 'TIER2' || tier === 'BOTH') {
        // Delete existing TIER2 questions
        const existing = await questionsService.getQuestionsByTemplate('tpl_tier2_detailed_assessment');
        if (existing.success && existing.data) {
          for (const question of existing.data) {
            await questionsService.deleteQuestion(question.id);
            results.deleted++;
          }
        }
        
        // Create new TIER2 questions
        const tier2Result = await questionsService.bulkSaveQuestions(TIER2_DEFAULT_QUESTIONS);
        if (tier2Result.success) {
          results.tier2Reset = tier2Result.data.length;
        }
      }
      
      console.log('Reset to defaults completed:', results);
      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummySeedService.resetToDefaults(tier);
  },

  // Get current question counts
  async getQuestionCounts() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummySeedService.getQuestionCounts();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const tier1Result = await questionsService.getQuestionsByTemplate('tpl_tier1_digital_readiness');
      const tier2Result = await questionsService.getQuestionsByTemplate('tpl_tier2_detailed_assessment');
      
      return {
        success: true,
        data: {
          tier1: tier1Result.success ? tier1Result.data.length : 0,
          tier2: tier2Result.success ? tier2Result.data.length : 0,
          total: (tier1Result.success ? tier1Result.data.length : 0) + 
                 (tier2Result.success ? tier2Result.data.length : 0)
        }
      };
    } catch (error) {
      console.error('Failed to get question counts:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummySeedService.getQuestionCounts();
  }
};