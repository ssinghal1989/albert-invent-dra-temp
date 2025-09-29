import { client } from "../amplifyClient";

export const questionsService = {
  // Get all questions from database
  async getAllQuestions() {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    try {
      const result = await client.models.Question.list({
        // include: {
        //   options: true,
        //   template: true
        // }
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Get all questions error:", error);
      return { success: false, error };
    }
  },

  // Get questions by template ID
  async getQuestionsByTemplate(templateId: string) {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    try {
      const result = await client.models.Question.list({
        filter: {
          templateId: { eq: templateId },
        },
        authMode: "apiKey",
        selectionSet: [
            'id',
            'templateId',
            'sectionId',
            'order',
            'kind',
            'prompt',
            'helpText',
            'required',
            'metadata',
            'options.label',
            'options.value',
            'options.score',
        ]
      });
    //   result?.data?.forEach(async (q) => {
    //     await client.models.Question.delete({
    //       id: q.id,
          
    //     }, { authMode: 'apiKey'});
    //   });
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Get questions by template error:", error);
      return { success: false, error };
    }
  },

  // Get questions by section
  async getQuestionsBySection(sectionId: string) {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    try {
      const result = await client.models.Question.list({
        filter: {
          sectionId: { eq: sectionId },
        },
        authMode: "apiKey",
        // include: {
        //   options: true
        // }
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Get questions by section error:", error);
      return { success: false, error };
    }
  },

  // Save a new question to database
  async saveQuestion(questionData: {
    templateId: string;
    sectionId: string;
    order: number;
    kind: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SCALE" | "TEXT";
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
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    try {
      // First create the question
      const questionResult = await client.models.Question.create(
        {
          templateId: questionData.templateId,
          sectionId: questionData.sectionId,
          order: questionData.order,
          kind: questionData.kind,
          prompt: questionData.prompt,
          helpText: questionData.helpText,
          required: questionData.required ?? true,
          metadata: JSON.stringify(questionData.metadata || {}),
        },
        {
          authMode: "apiKey",
        }
      );

      if (!questionResult.data) {
        throw new Error("Failed to create question");
      }

      // Then create the options if provided
      const savedOptions = [];
      if (questionData.options && questionData.options.length > 0) {
        for (const option of questionData.options) {
          const optionResult = await client.models.Option.create(
            {
              questionId: questionResult.data.id,
              label: option.label,
              value: option.value,
              score: option.score,
            },
            { authMode: "apiKey" }
          );

          if (optionResult.data) {
            savedOptions.push(optionResult.data);
          }
        }
      }

      const completeQuestion = {
        ...questionResult.data,
        options: savedOptions,
      };

      return { success: true, data: completeQuestion };
    } catch (error) {
      console.error("Save question error:", error);
      return { success: false, error };
    }
  },

  // Bulk save multiple questions
  async bulkSaveQuestions(
    questionsData: any[]
  ): Promise<{ success: boolean; data?: any[]; error?: any }> {
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
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
      console.error("Bulk save questions error:", error);
      return { success: false, error };
    }
  },
};
