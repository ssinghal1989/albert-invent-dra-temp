// Dummy questions service that mimics real database operations
import { dummyQuestions, dummyNewQuestion } from '../data/questionsData';

// Simulate API delay
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for demo (in real app, this would be the database)
let questionsStorage = [...dummyQuestions];

export const dummyQuestionsService = {
  // Get all questions
  async getAllQuestions() {
    await simulateDelay(1000);
    
    try {
      return { 
        success: true, 
        data: questionsStorage.map(q => ({
          ...q,
          options: q.options || []
        }))
      };
    } catch (error) {
      console.error('Get all questions error:', error);
      return { success: false, error };
    }
  },

  // Get questions by template ID
  async getQuestionsByTemplate(templateId: string) {
    await simulateDelay(800);
    
    try {
      const questions = questionsStorage.filter(q => q.templateId === templateId);
      return { 
        success: true, 
        data: questions.map(q => ({
          ...q,
          options: q.options || []
        }))
      };
    } catch (error) {
      console.error('Get questions by template error:', error);
      return { success: false, error };
    }
  },

  // Get questions by section
  async getQuestionsBySection(sectionId: string) {
    await simulateDelay(600);
    
    try {
      const questions = questionsStorage.filter(q => q.sectionId === sectionId);
      return { 
        success: true, 
        data: questions.map(q => ({
          ...q,
          options: q.options || []
        }))
      };
    } catch (error) {
      console.error('Get questions by section error:', error);
      return { success: false, error };
    }
  },

  // Save a new question
  async saveQuestion(questionData: any) {
    await simulateDelay(1200);
    
    try {
      const newQuestion = {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...questionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        options: questionData.options?.map((option: any, index: number) => ({
          id: `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
          questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...option
        })) || []
      };
      
      questionsStorage.push(newQuestion);
      
      return { success: true, data: newQuestion };
    } catch (error) {
      console.error('Save question error:', error);
      return { success: false, error };
    }
  },

  // Update an existing question
  async updateQuestion(questionId: string, updateData: any) {
    await simulateDelay(1000);
    
    try {
      const questionIndex = questionsStorage.findIndex(q => q.id === questionId);
      
      if (questionIndex === -1) {
        return { success: false, error: { message: 'Question not found' } };
      }
      
      const updatedQuestion = {
        ...questionsStorage[questionIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
        options: updateData.options?.map((option: any, index: number) => ({
          id: option.id || `opt_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
          questionId: questionId,
          ...option
        })) || questionsStorage[questionIndex].options
      };
      
      questionsStorage[questionIndex] = updatedQuestion;
      
      return { success: true, data: updatedQuestion };
    } catch (error) {
      console.error('Update question error:', error);
      return { success: false, error };
    }
  },

  // Delete a question
  async deleteQuestion(questionId: string) {
    await simulateDelay(600);
    
    try {
      const questionIndex = questionsStorage.findIndex(q => q.id === questionId);
      
      if (questionIndex === -1) {
        return { success: false, error: { message: 'Question not found' } };
      }
      
      const deletedQuestion = questionsStorage.splice(questionIndex, 1)[0];
      
      return { success: true, data: deletedQuestion };
    } catch (error) {
      console.error('Delete question error:', error);
      return { success: false, error };
    }
  },

  // Bulk save questions
  async bulkSaveQuestions(questionsData: any[]) {
    await simulateDelay(2000); // Longer delay for bulk operation
    
    try {
      const savedQuestions = questionsData.map((questionData, index) => {
        const newQuestion = {
          id: `q_bulk_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          ...questionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          options: questionData.options?.map((option: any, optIndex: number) => ({
            id: `opt_bulk_${Date.now()}_${index}_${optIndex}_${Math.random().toString(36).substr(2, 6)}`,
            questionId: `q_bulk_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            ...option
          })) || []
        };
        
        questionsStorage.push(newQuestion);
        return newQuestion;
      });
      
      return { success: true, data: savedQuestions };
    } catch (error) {
      console.error('Bulk save questions error:', error);
      return { success: false, error };
    }
  }
};