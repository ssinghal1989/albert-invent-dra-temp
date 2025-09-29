import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { TrendingUp, User, Mail, Building, Briefcase, CheckCircle, ArrowRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { UserData } from '../context/AppContext';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';
import 'react-calendar/dist/Calendar.css';

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: 'tier1' | 'tier2') => void;
  onShowLogin: () => void;
}

interface Tier2FormData extends UserData {
  selectedDate: Date | null;
  selectedTimes: string[];
}

export function Tier2Assessment({ onNavigateToTier, onShowLogin }: Tier2AssessmentProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation'>('form');
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

  const [tier2FormData, setTier2FormData] = useState<Tier2FormData>({
    ...formData,
    selectedDate: null,
    selectedTimes: []
  });
  
  const [tier2Errors, setTier2Errors] = useState<{
    selectedDate?: string;
    selectedTimes?: string;
  }>({});
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

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

  // Update tier2FormData when formData changes
  React.useEffect(() => {
    setTier2FormData(prev => ({
      ...prev,
      ...formData
    }));
  }, [formData]);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18; // Changed to 18 to include 6PM (18:00)
    
    for (let hour = startHour; hour <= endHour; hour++) {
      // For the last hour (6PM), only add the top of the hour slot
      const maxMinute = hour === endHour ? 0 : 30;
      for (let minute = 0; minute <= maxMinute; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({
          value: time24,
          label: time12,
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

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date | null) => {
    if (!date) return [];
    
    // Simulate some unavailable slots based on date
    const unavailableSlots = ['10:00', '14:30', '15:30'];
    
    return timeSlots.filter(slot => !unavailableSlots.includes(slot.value));
  };

  const handleTier2InputChange = (field: keyof Pick<Tier2FormData, 'selectedDate' | 'selectedTimes'>, value: any) => {
    setTier2FormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes selection
    if (tier2Errors[field]) {
      setTier2Errors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateTier2Form = (): boolean => {
    const newErrors: { selectedDate?: string; selectedTimes?: string } = {};

    if (!tier2FormData.selectedDate) {
      newErrors.selectedDate = 'Please select a preferred date';
    }

    if (tier2FormData.selectedTimes.length === 0) {
      newErrors.selectedTimes = 'Please select at least one preferred time';
    }

    setTier2Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both user form and tier2 specific fields
    const isUserFormValid = validateForm();
    const isTier2FormValid = validateTier2Form();
    
    if (isUserFormValid && isTier2FormValid) {
      withLoading(async () => {
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1800));
        setCurrentStep('confirmation');
      });
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && 
                     tier2FormData.selectedDate !== null &&
                     tier2FormData.selectedTimes.length > 0;

  const handleDateSelect = (data: any) => {
    handleTier2InputChange('selectedDate', data);
    handleTier2InputChange('selectedTimes', []);
    setShowCalendar(false);
    setShowTimeSlots(true);
  };

  const handleTimeSelect = (time: string) => {
    setTier2FormData(prev => {
      const currentTimes = prev.selectedTimes;
      const isSelected = currentTimes.includes(time);

      let newTimes;
      if (isSelected) {
        // Remove time if already selected
        newTimes = currentTimes.filter((t) => t !== time);
      } else {
        // Add time if not selected
        newTimes = [...currentTimes, time].sort();
      }

      return { ...prev, selectedTimes: newTimes };
    });
  };

  const formatSelectedDate = () => {
    if (!tier2FormData.selectedDate) return '';
    return tier2FormData.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSelectedTimeLabels = () => {
    return tier2FormData.selectedTimes
      .map((timeValue) => {
        const slot = timeSlots.find((time) => time.value === timeValue);
        return slot ? slot.label : timeValue;
      })
      .join(", ");
  };

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
                  <span className="text-gray-700">{tier2FormData.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{tier2FormData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{tier2FormData.companyName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{tier2FormData.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">
                    {formatSelectedDate()} at {getSelectedTimeLabels()}
                  </span>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={tier2FormData.name}
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
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={tier2FormData.email}
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
                  value={tier2FormData.companyName}
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
                  value={tier2FormData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    errors.jobTitle ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your job title"
                />
              </div>
              {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`w-full flex items-center justify-between px-4 py-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  tier2Errors.selectedDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className={tier2FormData.selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                    {tier2FormData.selectedDate ? formatSelectedDate() : 'Select a preferred date'}
                  </span>
                </div>
              </button>
              {tier2Errors.selectedDate && <p className="mt-1 text-sm text-red-600">{tier2Errors.selectedDate}</p>}
              
              {showCalendar && !showTimeSlots && (
                <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <Calendar
                    onChange={handleDateSelect}
                    value={tier2FormData.selectedDate}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)} // 60 days from now
                    tileDisabled={({ date }) => !isDateAvailable(date)}
                    className="react-calendar-custom"
                  />
                </div>
              )}
            </div>

            {/* Time Selection */}
            {showTimeSlots && tier2FormData.selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Time Slots
                  </label>
                  {tier2FormData.selectedTimes.length > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {tier2FormData.selectedTimes.length} selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  You can select multiple time slots to give us more options
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableTimeSlots(tier2FormData.selectedDate).map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => handleTimeSelect(slot.value)}
                      className={`p-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                        tier2FormData.selectedTimes.includes(slot.value)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{slot.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {tier2Errors.selectedTimes && <p className="mt-1 text-sm text-red-600">{tier2Errors.selectedTimes}</p>}
              </div>
            )}

            {/* Selected Time Summary */}
            {tier2FormData.selectedDate && tier2FormData.selectedTimes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Selected Assessment Time{tier2FormData.selectedTimes.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatSelectedDate()} at {getSelectedTimeLabels()}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              Our team will contact you to confirm your preferred time or suggest alternatives if needed.
            </p>
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
      </div>
    </main>
  );
}