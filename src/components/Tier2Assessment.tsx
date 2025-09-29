import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { TrendingUp, User, Mail, Building, Briefcase, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';
import 'react-calendar/dist/Calendar.css';

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onShowLogin: () => void;
}

interface Tier2FormData {
  name: string;
  email: string;
  jobTitle: string;
  company: string;
  additionalInfo: string;
  preferredDate: Date | null;
  preferredTime: string;
}

export function Tier2Assessment({ onNavigateToTier, onShowLogin }: Tier2AssessmentProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState<Tier2FormData>({
    name: '',
    email: '',
    jobTitle: '',
    company: '',
    additionalInfo: '',
    preferredDate: null,
    preferredTime: ''
  });
  const [errors, setErrors] = useState<Partial<Tier2FormData>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Generate time slots dynamically
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({
          value: time24,
          label: time12
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if date is available (exclude weekends and past dates)
  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
  };

  // Get available time slots for selected date (simulate some unavailable slots)
  const getAvailableTimeSlots = (date: Date | null) => {
    if (!date) return [];
    
    // Simulate some unavailable slots based on date
    const unavailableSlots = ['10:00', '14:30', '15:30'];
    
    return timeSlots.filter(slot => !unavailableSlots.includes(slot.value));
  };

  const handleInputChange = (field: keyof Tier2FormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show time slots when date is selected
    if (field === 'preferredDate' && value) {
      setShowTimeSlots(true);
      setFormData(prev => ({ ...prev, preferredTime: '' })); // Reset time when date changes
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Tier2FormData> = {};

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

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required';
    }

    if (!formData.preferredTime.trim()) {
      newErrors.preferredTime = 'Preferred time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      withLoading(async () => {
        // Simulate form submission and scheduling
        await new Promise(resolve => setTimeout(resolve, 1800));
        setCurrentStep('confirmation');
      });
    }
  };

  const isFormValid = formData.name.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.jobTitle.trim() !== '' && 
                     formData.company.trim() !== '' &&
                     formData.preferredDate !== null &&
                     formData.preferredTime.trim() !== '';

  const formatSelectedDate = () => {
    if (!formData.preferredDate) return '';
    return formData.preferredDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSelectedTimeLabel = () => {
    const selectedTime = timeSlots.find(time => time.value === formData.preferredTime);
    return selectedTime ? selectedTime.label : '';
  };

  if (currentStep === 'confirmation') {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Meeting Scheduled!</h1>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for your interest in our Tier 2 Digital Readiness Assessment.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Meeting Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{formData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">
                    {formatSelectedDate()} at {getSelectedTimeLabel()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              <p>You will receive a calendar invitation and meeting details via email shortly.</p>
              <p className="mt-2">Our team will reach out to you before the scheduled meeting.</p>
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
              Assessment Tier 2
            </h1>
            <p className="text-gray-600 text-lg">
              Hello! Please tell us a little about yourself. Our team will get back to you shortly.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
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

            {/* Company Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.company ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your company name"
                />
              </div>
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
              <p className="mt-1 text-xs text-gray-500 italic">Auto-generated team code in email confirmation</p>
            </div>

            {/* Preferred Date Field */}
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <div className="relative mb-2">
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`w-full flex items-center justify-between px-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.preferredDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <span className={formData.preferredDate ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.preferredDate ? formatSelectedDate() : 'Select a date'}
                    </span>
                  </div>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              
              {showCalendar && (
                <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <Calendar
                    onChange={(date) => {
                      handleInputChange('preferredDate', date as Date);
                      setShowCalendar(false);
                    }}
                    value={formData.preferredDate}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)} // 60 days from now
                    tileDisabled={({ date }) => !isDateAvailable(date)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>

            {/* Preferred Time Field */}
            {showTimeSlots && formData.preferredDate && (
              <div>
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {getAvailableTimeSlots(formData.preferredDate).map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleInputChange('preferredTime', slot.value)}
                      className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        formData.preferredTime === slot.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                {errors.preferredTime && <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>}
              </div>
            )}

            {/* Show selected time summary */}
            {formData.preferredDate && formData.preferredTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Selected Meeting Time</p>
                    <p className="text-sm text-gray-600">
                      {formatSelectedDate()} at {getSelectedTimeLabel()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Field */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Is there any other intake info we should request at this point?
              </label>
              <textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={4}
                className="block w-full px-3 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Please share any additional information that would help us prepare for your assessment..."
              />
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={submitLoading}
              loadingText="Scheduling Meeting..."
              disabled={!isFormValid}
              className="w-full py-4"
              size="lg"
            >
              Request Tier 2 Assessment
            </LoadingButton>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .react-calendar-custom {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .react-calendar-custom .react-calendar__tile {
          border-radius: 8px;
          margin: 2px;
        }
        
        .react-calendar-custom .react-calendar__tile--active {
          background: #05f;
          color: white;
        }
        
        .react-calendar-custom .react-calendar__tile:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
        }
        
        .react-calendar-custom .react-calendar__tile:enabled:hover {
          background-color: #e6f3ff;
        }
      `}</style>
    </main>
  );
}