// Questions service with dual-mode support (dummy + real Amplify)
import { generateClient } from 'aws-amplify/data';
import { dummyQuestionsService } from '../dummy/services/dummyQuestionsService';
import type { Schema } from '../../amplify/data/resource';

// GraphQL client - will be initialized after Amplify.configure()
let client: ReturnType<typeof generateClient<Schema>> | null = null;
let isAmplifyConfigured = false;

// Flag to determine if we should use dummy data (when Amplify is not configured)
const USE_DUMMY_DATA = !isAmplifyConfigured;

// Initialize the GraphQL client
export const initializeQuestionsClient = () => {
  isAmplifyConfigured = true;
  client = generateClient<Schema>();
};

const getClient = () => {
  if (!isAmplifyConfigured) {
    throw new Error('Amplify not configured yet. Please wait for initialization to complete.');
  }
  if (!client) {
    client = generateClient<Schema>();
  }
  return client;
};

export const questionsService = {
  // Get all questions from database
  async getAllQuestions() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.getAllQuestions();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.Question.list({
        include: {
          options: true,
          template: true
        }
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Get all questions error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.getAllQuestions();
  },

  // Get questions by template ID
  async getQuestionsByTemplate(templateId: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.getQuestionsByTemplate(templateId);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.Question.list({
        filter: {
          templateId: { eq: templateId }
        },
        include: {
          options: true
        }
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Get questions by template error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.getQuestionsByTemplate(templateId);
  },

  // Get questions by section
  async getQuestionsBySection(sectionId: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.getQuestionsBySection(sectionId);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.Question.list({
        filter: {
          sectionId: { eq: sectionId }
        },
        include: {
          options: true
        }
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Get questions by section error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.getQuestionsBySection(sectionId);
  },

  // Save a new question to database
  async saveQuestion(questionData: {
    templateId: string;
    sectionId: string;
    order: number;
    kind: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
    prompt: string;
    helpText?: string;
    required?: boolean;
    metadata?: any;
    options?: Array<{
      label: string;
      value: string;
      score?: number;
    }>;
  }) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.saveQuestion(questionData);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      // First create the question
      const questionResult = await getClient().models.Question.create({
        templateId: questionData.templateId,
        sectionId: questionData.sectionId,
        order: questionData.order,
        kind: questionData.kind,
        prompt: questionData.prompt,
        helpText: questionData.helpText,
        required: questionData.required ?? true,
        metadata: questionData.metadata
      });

      if (!questionResult.data) {
        throw new Error('Failed to create question');
      }

      // Then create the options if provided
      const savedOptions = [];
      if (questionData.options && questionData.options.length > 0) {
        for (const option of questionData.options) {
          const optionResult = await getClient().models.Option.create({
            questionId: questionResult.data.id,
            label: option.label,
            value: option.value,
            score: option.score
          });
          
          if (optionResult.data) {
            savedOptions.push(optionResult.data);
          }
        }
      }

      const completeQuestion = {
        ...questionResult.data,
        options: savedOptions
      };

      return { success: true, data: completeQuestion };
    } catch (error) {
      console.error('Save question error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.saveQuestion(questionData);
  },

  // Update an existing question
  async updateQuestion(questionId: string, updateData: any) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.updateQuestion(questionId, updateData);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.Question.update({
        id: questionId,
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Update question error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.updateQuestion(questionId, updateData);
  },

  // Delete a question
  async deleteQuestion(questionId: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.deleteQuestion(questionId);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      // First delete all options for this question
      const optionsResult = await getClient().models.Option.list({
        filter: {
          questionId: { eq: questionId }
        }
      });

      if (optionsResult.data) {
        for (const option of optionsResult.data) {
          await getClient().models.Option.delete({ id: option.id });
        }
      }

      // Then delete the question
      const result = await getClient().models.Question.delete({ id: questionId });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Delete question error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.deleteQuestion(questionId);
  },

  // Bulk save multiple questions
  async bulkSaveQuestions(questionsData: any[]) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyQuestionsService.bulkSaveQuestions(questionsData);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const savedQuestions = [];
      
      for (const questionData of questionsData) {
        const result = await this.saveQuestion(questionData);
        if (result.success && result.data) {
          savedQuestions.push(result.data);
        }
      }
      
      return { success: true, data: savedQuestions };
    } catch (error) {
      console.error('Bulk save questions error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyQuestionsService.bulkSaveQuestions(questionsData);
  }
};