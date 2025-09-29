// Seed data service for initializing default questions
import { questionsService } from "./questionsService";
import {
  TIER1_DEFAULT_QUESTIONS,
  TIER2_DEFAULT_QUESTIONS,
  DEFAULT_ASSESSMENT_TEMPLATES,
  Tier1TemplateId,
  Tier2TemplateId,
} from "./defaultQuestions";
import { apiService } from "./amplifyService";

export const seedDataService = {
  // Initialize default questions for both tiers
  async initializeDefaultQuestions() {

    try {
      // First, create assessment templates if they don't exist
      await this.createDefaultTemplates();

      // Check if questions already exist
      const existingTier1 = await questionsService.getQuestionsByTemplate(
        Tier1TemplateId
      );
      const existingTier2 = await questionsService.getQuestionsByTemplate(
        Tier2TemplateId
      );

      let results = {
        tier1Created: 0,
        tier2Created: 0,
        templatesCreated: 0,
      };

      // Create TIER1 questions if they don't exist
      if (!existingTier1.success || existingTier1?.data?.length === 0) {
        const tier1Result = await questionsService.bulkSaveQuestions(
          TIER1_DEFAULT_QUESTIONS
        );
        if (tier1Result.success) {
          results.tier1Created = tier1Result?.data?.length || 0;
        }
      }

      // Create TIER2 questions if they don't exist
      if (!existingTier2.success || existingTier2?.data?.length === 0) {
        const tier2Result = await questionsService.bulkSaveQuestions(
          TIER2_DEFAULT_QUESTIONS
        );
        if (tier2Result.success) {
          results.tier2Created = tier2Result?.data?.length || 0;
        }
      }
      return { success: true, data: results };
    } catch (error) {
      console.error("Failed to initialize default questions:", error);
      return { success: false, error };
    }
  },

  // Create default assessment templates
  async createDefaultTemplates() {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    try {
      for (const template of DEFAULT_ASSESSMENT_TEMPLATES) {
        // Check if template already exists
        const existing = await apiService.getAssessmentTemplate(template.slug);

        if (!existing.success || !existing.data) {
          const result = await apiService.createAssessmentTemplate(
            template as any
          );
          if (result.success) {
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to create default templates:", error);
      return { success: false, error };
    }
  },

  // Reset questions to defaults (useful for admin)
  async resetToDefaults(tier: "TIER1" | "TIER2" | "BOTH" = "BOTH") {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      
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
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
      return { success: false, error };
    }
    */
  },

  // Get current question counts
  async getQuestionCounts() {
    try {
      const tier1Result = await questionsService.getQuestionsByTemplate(
        Tier1TemplateId
      );
      const tier2Result = await questionsService.getQuestionsByTemplate(
        Tier2TemplateId
      );

      return {
        success: true,
        data: {
          tier1: tier1Result.success ? tier1Result.data?.length ?? 0 : 0,
          tier2: tier2Result.success ? tier2Result.data?.length ?? 0 : 0,
          total:
            (tier1Result?.success ? tier1Result.data?.length ?? 0 : 0) +
            (tier2Result?.success ? tier2Result.data?.length ?? 0 : 0),
        },
      };
    } catch (error) {
      console.error("Failed to get question counts:", error);
      return { success: false, error };
    }
  },
};
