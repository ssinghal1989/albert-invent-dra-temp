// Dummy authentication service that mimics Amplify Auth
import { domainBlockingService } from '../../services/domainBlockingService';

// Simulate API delay with realistic timing
const simulateDelay = (ms: number = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory user storage for demo
let dummyUsers: any[] = [];
let currentUser: any = null;

export const dummyAuthService = {
  async signUp(email: string, password: string, name: string) {
    await simulateDelay(1000); // Sign up delay
    
    try {
      // Check domain blocking
      const domainCheck = domainBlockingService.isEmailAllowed(email);
      if (!domainCheck.allowed) {
        return { 
          success: false, 
          error: { message: domainCheck.reason || 'Email domain not allowed' }
        };
      }

      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        password, // In real app, this would be hashed
        confirmed: false,
        createdAt: new Date().toISOString()
      };
      
      dummyUsers.push(user);
      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error };
    }
  },

  async confirmSignUp(email: string, code: string) {
    await simulateDelay(800); // OTP confirmation delay
    
    try {
      const user = dummyUsers.find(u => u.email === email);
      if (user) {
        user.confirmed = true;
        return { success: true };
      }
      return { success: false, error: { message: 'User not found' } };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      return { success: false, error };
    }
  },

  async signIn(email: string, password: string) {
    await simulateDelay(900); // Sign in delay
    
    try {
      // Check domain blocking
      const domainCheck = domainBlockingService.isEmailAllowed(email);
      if (!domainCheck.allowed) {
        return { 
          success: false, 
          error: { message: domainCheck.reason || 'Email domain not allowed' }
        };
      }

      const user = dummyUsers.find(u => u.email === email && u.password === password);
      if (user && user.confirmed) {
        currentUser = user;
        return { success: true, user };
      }
      return { success: false, error: { message: 'Invalid credentials' } };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
  },

  async signOut() {
    await simulateDelay(300); // Quick sign out
    
    try {
      currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error };
    }
  },

  async getCurrentUser() {
    await simulateDelay(400); // Check current user
    
    try {
      if (currentUser) {
        return { success: true, user: currentUser };
      }
      return { success: false, error: { message: 'No current user' } };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error };
    }
  },

  // Dummy OTP methods
  async sendOTP(email: string) {
    await simulateDelay(700); // Send OTP delay
    
    try {
      console.log(`Dummy OTP sent to ${email}: 123456`);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  async verifyOTP(email: string, code: string) {
    await simulateDelay(600); // Verify OTP delay
    
    try {
      // Accept any 6-digit code for demo
      if (code.length === 6) {
        return { success: true };
      }
      return { success: false, error: { message: 'Invalid OTP' } };
    } catch (error) {
      return { success: false, error };
    }
  }
};