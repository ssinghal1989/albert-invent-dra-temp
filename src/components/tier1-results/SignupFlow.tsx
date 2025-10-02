import React from 'react';
import { LoginPage } from '../LoginPage';
import { OtpVerificationPage } from '../OtpVerificationPage';
import { UserData } from '../../context/AppContext';
import { LocalSchema } from '../../amplifyClient';

interface SignupFlowProps {
  showSignupForm: boolean;
  showSignupOtp: boolean;
  signupFormData: UserData | null;
  onSignupFormSubmit: (userData: UserData) => void;
  onSignupOtpVerification: (data: { user?: LocalSchema["User"]["type"]; company?: LocalSchema["Company"]["type"] }) => void;
  onCancelSignupForm: () => void;
  onCancelSignupOtp: () => void;
}

export function SignupFlow({
  showSignupForm,
  showSignupOtp,
  signupFormData,
  onSignupFormSubmit,
  onSignupOtpVerification,
  onCancelSignupForm,
  onCancelSignupOtp
}: SignupFlowProps) {
  return (
    <>
      {/* Signup Form Modal for Anonymous Users */}
      {showSignupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <LoginPage 
              onLogin={onSignupFormSubmit} 
              onCancel={onCancelSignupForm}
              buttonText="Create Account"
              title="Create Your Account"
              subtitle="Sign up to save your assessment results"
            />
          </div>
        </div>
      )}

      {/* Signup OTP Verification Modal */}
      {showSignupOtp && signupFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <OtpVerificationPage
              userEmail={signupFormData.email}
              onVerify={onSignupOtpVerification}
              onCancel={onCancelSignupOtp}
            />
          </div>
        </div>
      )}
    </>
  );
}