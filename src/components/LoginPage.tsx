import React, { useState } from 'react';
import { User, Mail, Building, Briefcase, ArrowRight } from 'lucide-react';
import { UserData } from '../context/AppContext';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';

interface LoginPageProps {
  onLogin: (userData: UserData) => void;
  onCancel: () => void;
}

export function LoginPage({ onLogin, onCancel }: LoginPageProps) {
  const { isLoading, withLoading } = useLoader();
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    companyName: '',
    jobTitle: ''
  });

  const [errors, setErrors] = useState<Partial<UserData>>({});

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      withLoading(async () => {
        // Simulate form processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
        onLogin(formData);
      });
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
  const {
    formData,
    errors,
    loading,
    isFormValid,
    isUserLoggedIn,
    handleInputChange,
    handleSubmit,
  } = useUserForm({
    submitAssessment: true,
    redirectPath: "/tier1-results",
  });

}