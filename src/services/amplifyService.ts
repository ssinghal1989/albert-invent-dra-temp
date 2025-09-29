import { generateClient } from 'aws-amplify/data';
import { signUp, signIn, signOut, getCurrentUser, confirmSignUp } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { domainBlockingService } from './domainBlockingService';
import { dummyApiService } from '../dummy/services/dummyApiService';
import { dummyAuthService } from '../dummy/services/dummyAuthService';
import type { Schema } from '../../amplify/data/resource';

// GraphQL client - will be initialized after Amplify.configure()
let client: ReturnType<typeof generateClient<Schema>> | null = null;
let isAmplifyConfigured = false;

// Flag to determine if we should use dummy data (when Amplify is not configured)
const USE_DUMMY_DATA = !isAmplifyConfigured;

// Initialize the GraphQL client and mark Amplify as configured
export const initializeClient = () => {
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
// Authentication services
export const authService = {
  async signUp(email: string, password: string, name: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyAuthService.signUp(email, password, name);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      // Check domain blocking
      const domainCheck = domainBlockingService.isEmailAllowed(email);
      if (!domainCheck.allowed) {
        return { 
          success: false, 
          error: { message: domainCheck.reason || 'Email domain not allowed' }
        };
      }

      const { user } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyAuthService.signUp(email, password, name);
  },

  async confirmSignUp(email: string, code: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyAuthService.confirmSignUp(email, code);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { success: true };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyAuthService.confirmSignUp(email, code);
  },

  async signIn(email: string, password: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyAuthService.signIn(email, password);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      // Check domain blocking
      const domainCheck = domainBlockingService.isEmailAllowed(email);
      if (!domainCheck.allowed) {
        return { 
          success: false, 
          error: { message: domainCheck.reason || 'Email domain not allowed' }
        };
      }

      const { user } = await signIn({
        username: email,
        password,
      });
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyAuthService.signIn(email, password);
  },

  async signOut() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyAuthService.signOut();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyAuthService.signOut();
  },

  async getCurrentUser() {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyAuthService.getCurrentUser();
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const user = await getCurrentUser();
      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyAuthService.getCurrentUser();
  },
};

// API services
export const apiService = {
  async getAssessmentTemplate(slug: string, version?: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.getAssessmentTemplate(slug, version);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().queries.getAssessmentTemplate({
        slug,
        version: version || '1.0.0'
      }, {
        authMode: 'apiKey'
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Get assessment template error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.getAssessmentTemplate(slug, version);
  },

  async createAssessmentInstance(templateId: string, type: 'HIGH_LEVEL' | 'DETAILED', metadata?: any) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.createAssessmentInstance(templateId, type, metadata);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().mutations.createAssessmentInstance({
        templateId,
        type,
        metadata
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Create assessment instance error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.createAssessmentInstance(templateId, type, metadata);
  },

  async submitAssessment(assessmentInstanceId: string, responses: Record<string, any>) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.submitAssessment(assessmentInstanceId, responses);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().mutations.submitAssessment({
        assessmentInstanceId,
        responses
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Submit assessment error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.submitAssessment(assessmentInstanceId, responses);
  },

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    companyId?: string;
  }) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.createUser(userData);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.User.create({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        jobTitle: userData.jobTitle,
        companyId: userData.companyId,
        role: 'member'
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.createUser(userData);
  },

  async createOrGetCompany(domain: string, name: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.createOrGetCompany(domain, name);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      // First try to find existing company by domain
      const existingCompanies = await getClient().models.Company.list({
        filter: {
          primaryDomain: { eq: domain }
        }
      });

      if (existingCompanies.data && existingCompanies.data.length > 0) {
        return { success: true, data: existingCompanies.data[0] };
      }

      // Create new company if not found
      const result = await getClient().models.Company.create({
        name,
        primaryDomain: domain,
        status: 'ACTIVE'
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Create or get company error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.createOrGetCompany(domain, name);
  },

  async recordConsent(userId: string, consentText: string, version: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.recordConsent(userId, consentText, version);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.ConsentRecord.create({
        userId,
        consentText,
        version,
        accepted: true,
        acceptedAt: new Date().toISOString()
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Record consent error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.recordConsent(userId, consentText, version);
  },

  async getUserAssessments(userId: string) {
    // DUMMY DATA: Remove this block when using real Amplify
    if (USE_DUMMY_DATA) {
      return await dummyApiService.getUserAssessments(userId);
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getClient().models.AssessmentInstance.list({
        filter: {
          initiatorUserId: { eq: userId }
        }
      });
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Get user assessments error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return await dummyApiService.getUserAssessments(userId);
  },
};

// Storage services
export const storageService = {
  async uploadFile(key: string, file: File) {
    // DUMMY DATA: For development, just return a mock response
    if (USE_DUMMY_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      return { 
        success: true, 
        data: { 
          key, 
          url: `https://dummy-storage.example.com/${key}` 
        } 
      };
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
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
    */
    
    // Fallback for when Amplify is not configured
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      data: { 
        key, 
        url: `https://dummy-storage.example.com/${key}` 
      } 
    };
  },

  async getFileUrl(key: string) {
    // DUMMY DATA: For development, just return a mock URL
    if (USE_DUMMY_DATA) {
      return { 
        success: true, 
        url: `https://dummy-storage.example.com/${key}` 
      };
    }
    
    // REAL AMPLIFY CODE: Uncomment when Amplify is configured
    /*
    try {
      const result = await getUrl({
        key,
      });
      return { success: true, url: result.url };
    } catch (error) {
      console.error('Get file URL error:', error);
      return { success: false, error };
    }
    */
    
    // Fallback for when Amplify is not configured
    return { 
      success: true, 
      url: `https://dummy-storage.example.com/${key}` 
    };
  },
};