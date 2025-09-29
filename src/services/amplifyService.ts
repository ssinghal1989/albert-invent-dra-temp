import { getUrl, uploadData } from 'aws-amplify/storage';
import { client, LocalSchema } from '../amplifyClient';

// API services
export const apiService = {
  async getAssessmentTemplate(slug: string) {
    try {
      const result = await client.models.AssessmentTemplate.list({
        filter: {
          slug: { eq: slug },
        },
        authMode: 'apiKey'
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error };
    }
  },

  async createAssessmentTemplate(template: LocalSchema['AssessmentTemplate']['type']) {
    try {
      const result = await client.models.AssessmentTemplate.create({
        id: template.id,
        name: template.name,
        slug: template.slug,
        version: template.version,
        tier: template.tier,
      }, {
        authMode: 'apiKey'
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error };
    }
  },

//   async createAssessmentInstance(templateId: string, type: 'HIGH_LEVEL' | 'DETAILED', metadata?: any) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.createAssessmentInstance(templateId, type, metadata);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       const result = await getClient().mutations.createAssessmentInstance({
//         templateId,
//         type,
//         metadata
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Create assessment instance error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.createAssessmentInstance(templateId, type, metadata);
//   },

//   async submitAssessment(assessmentInstanceId: string, responses: Record<string, any>) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.submitAssessment(assessmentInstanceId, responses);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       const result = await getClient().mutations.submitAssessment({
//         assessmentInstanceId,
//         responses
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Submit assessment error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.submitAssessment(assessmentInstanceId, responses);
//   },

//   async createUser(userData: {
//     email: string;
//     firstName: string;
//     lastName: string;
//     jobTitle?: string;
//     companyId?: string;
//   }) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.createUser(userData);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       const result = await getClient().models.User.create({
//         email: userData.email,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         jobTitle: userData.jobTitle,
//         companyId: userData.companyId,
//         role: 'member'
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Create user error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.createUser(userData);
//   },

//   async createOrGetCompany(domain: string, name: string) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.createOrGetCompany(domain, name);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       // First try to find existing company by domain
//       const existingCompanies = await getClient().models.Company.list({
//         filter: {
//           primaryDomain: { eq: domain }
//         }
//       });

//       if (existingCompanies.data && existingCompanies.data.length > 0) {
//         return { success: true, data: existingCompanies.data[0] };
//       }

//       // Create new company if not found
//       const result = await getClient().models.Company.create({
//         name,
//         primaryDomain: domain,
//         status: 'ACTIVE'
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Create or get company error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.createOrGetCompany(domain, name);
//   },

//   async recordConsent(userId: string, consentText: string, version: string) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.recordConsent(userId, consentText, version);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       const result = await getClient().models.ConsentRecord.create({
//         userId,
//         consentText,
//         version,
//         accepted: true,
//         acceptedAt: new Date().toISOString()
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Record consent error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.recordConsent(userId, consentText, version);
//   },

//   async getUserAssessments(userId: string) {
//     // DUMMY DATA: Remove this block when using real Amplify
//     if (USE_DUMMY_DATA) {
//       return await dummyApiService.getUserAssessments(userId);
//     }
    
//     // REAL AMPLIFY CODE: Uncomment when Amplify is configured
//     /*
//     try {
//       const result = await getClient().models.AssessmentInstance.list({
//         filter: {
//           initiatorUserId: { eq: userId }
//         }
//       });
      
//       return { success: true, data: result.data };
//     } catch (error) {
//       console.error('Get user assessments error:', error);
//       return { success: false, error };
//     }
//     */
    
//     // Fallback for when Amplify is not configured
//     return await dummyApiService.getUserAssessments(userId);
//   },
};

// Storage services
export const storageService = {
  async uploadFile(key: string, file: File) {
    try {
      const result = await uploadData({
        key,
        data: file,
      }).result;
      return { success: true, data: result };
    } catch (error) {
      console.error('Upload file error:', error);
      return { success: false, error };
    }
  },

  async getFileUrl(key: string) {
    try {
      const result = await getUrl({
        key,
      });
      return { success: true, url: result.url };
    } catch (error) {
      console.error('Get file URL error:', error);
      return { success: false, error };
    }
  },
};