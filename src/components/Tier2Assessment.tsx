import React, { useState } from 'react';
import { TrendingUp, User, Mail, Building, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onShowLogin: () => void;
}

interface Tier2FormData {
  fullName: string;
  email: string;
  companyName: string;
  jobTitle: string;
}

export function Tier2Assessment({ onNavigateToTier, onShowLogin }: Tier2AssessmentProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState<Tier2FormData>({
    fullName: '',
    email: '',
    companyName: '',
    jobTitle: ''
  });
  const [errors, setErrors] = useState<Partial<Tier2FormData>>({});

  const handleInputChange = (field: keyof Tier2FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Tier2FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else {
      const domainCheck = domainBlockingService.isEmailAllowed(formData.email);
      if (!domainCheck.allowed) {
        newErrors.email = domainCheck.reason || 'Email domain not allowed';
      }
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      withLoading(async () => {
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1800));
        setCurrentStep('confirmation');
      });
    }
  };

  const isFormValid = formData.fullName.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.companyName.trim() !== '' && 
                     formData.jobTitle.trim() !== '';

  if (currentStep === 'confirmation') {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for your interest in our Tier 2 Digital Readiness Assessment.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.fullName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.companyName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.jobTitle}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              <p>Our team will review your request and contact you within 1-2 business days to schedule your in-depth assessment.</p>
              <p className="mt-2">You will receive a confirmation email shortly with next steps.</p>
            </div>

            <button
              onClick={() => onNavigateToTier('tier1')}
              className="bg-primary text-white py-3 px-8 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request Tier 2: In-Depth Assessment
            </h1>
            <p className="text-gray-600 text-lg">
              Please provide your information below and our team will contact you to schedule your detailed assessment.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Company Name Field */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.companyName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your company name"
                />
              </div>
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
            </div>

            {/* Job Title Field */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.jobTitle ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your job title"
                />
              </div>
              {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>}
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={submitLoading}
              loadingText="Submitting Request..."
              disabled={!isFormValid}
              className="w-full py-4"
              size="lg"
            >
              <span className="flex items-center space-x-2">
                <span>Request Tier 2 Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            </LoadingButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Our team will contact you within 1-2 business days to schedule your in-depth assessment session.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}