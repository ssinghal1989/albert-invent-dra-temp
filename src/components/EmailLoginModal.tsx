import React, { useState } from 'react';
import { Mail, ArrowRight, X } from 'lucide-react';
import { LOGIN_NEXT_STEP, useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { ifDomainAlloeded } from '../utils/domain';
import { getDomainFromEmail } from '../utils/common';
import { LoadingButton } from './ui/LoadingButton';

interface EmailLoginModalProps {
  onCancel: () => void;
}

export function EmailLoginModal({ onCancel }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    dispatch({ type: 'LOGIN_NEXT_STEP', payload: nextStep });
    dispatch({ type: 'SET_LOGIN_EMAIL', payload: email });
    dispatch({ type: 'SET_LOGIN_FLOW', payload: 'DIRECT' });
    navigate('/otp-login');
  }

  const { handleAuth, loading } = useAuthFlow(updateStateAndNavigateToOtp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!ifDomainAlloeded(getDomainFromEmail(email)!)) {
      setError('Please use your work email address');
      return;
    }
    await handleAuth(email);
  };

  const isEmailValid = email.trim() !== '' && validateEmail(email);

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Login to Your Account</h1>
          <p className="text-gray-600 text-sm sm:text-base">Enter your email address to receive a verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your email address"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <LoadingButton disabled={!isEmailValid} loadingText='Sending Verification Code ...' loading={loading} style={{width: '100%'}} >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              Send Verification Code
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </LoadingButton>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            We'll send a verification code to your email
          </p>
        </div>
      </div>
    </div>
  );
}