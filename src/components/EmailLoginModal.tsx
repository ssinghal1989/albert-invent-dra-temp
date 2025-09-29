import React, { useState } from 'react';
import { Mail, ArrowRight, X } from 'lucide-react';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';

interface EmailLoginModalProps {
  onSubmit: (email: string) => void;
  onCancel: () => void;
}

export function EmailLoginModal({ onSubmit, onCancel }: EmailLoginModalProps) {
  const { isLoading, withLoading } = useLoader();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const domainCheck = domainBlockingService.isEmailAllowed(email);
    if (!domainCheck.allowed) {
      setError(domainCheck.reason || 'Email domain not allowed');
      return;
    }

    withLoading(async () => {
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(email);
    });
  };

  const isEmailValid = email.trim() !== '' && validateEmail(email);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login to Your Account</h1>
          <p className="text-gray-600">Enter your email address to receive a verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your email address"
                autoFocus
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={isLoading}
            loadingText="Sending Code..."
            disabled={!isEmailValid}
            className="w-full py-4"
            size="lg"
          >
            <span className="flex items-center space-x-2">
              <span>Send Verification Code</span>
              <ArrowRight className="w-5 h-5" />
            </span>
          </LoadingButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            We'll send a 6-digit verification code to your email
          </p>
        </div>
      </div>
    </div>
  );
}