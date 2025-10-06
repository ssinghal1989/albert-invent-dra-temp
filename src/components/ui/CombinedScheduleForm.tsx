import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { X, User, Mail, Building, Briefcase, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { LoadingButton } from './LoadingButton';
import { useLoader } from '../../hooks/useLoader';
import 'react-calendar/dist/Calendar.css';

export interface CombinedScheduleData {
  // User info
  name: string;
  email: string;
  companyName: string;
  jobTitle: string;
  // Schedule info
  selectedDate: Date | null;
  selectedTimes: string[];
  remarks: string;
}

interface CombinedScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CombinedScheduleData) => Promise<void>;
  title?: string;
  initialData?: Partial<CombinedScheduleData>;
}

export function CombinedScheduleForm({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Schedule a Follow-up Call",
  initialData = {}
}: CombinedScheduleFormProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [formData, setFormData] = useState<CombinedScheduleData>({
    name: '',
    email: '',
    companyName: '',
    jobTitle: '',
    selectedDate: null,
    selectedTimes: [],
    remarks: '',
    ...initialData
  });
  const [errors, setErrors] = useState<Partial<CombinedScheduleData>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour <= endHour; hour++) {
      const maxMinute = hour === endHour ? 0 : 30;
      for (let minute = 0; minute <= maxMinute; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute
          .toString()
          .padStart(2, '0')} ${ampm}`;

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
    return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date | null) => {
    if (!date) return [];
    return timeSlots;
  };

  const handleInputChange = (field: keyof CombinedScheduleData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateSelect = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      selectedDate: data,
      selectedTimes: [],
    }));
    setShowCalendar(false);
    setShowTimeSlots(true);
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => {
      const currentTimes = prev.selectedTimes;
      const isSelected = currentTimes.includes(time);

      let newTimes;
      if (isSelected) {
        newTimes = currentTimes.filter((t) => t !== time);
      } else {
        newTimes = [...currentTimes, time].sort();
      }

      return { ...prev, selectedTimes: newTimes };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CombinedScheduleData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.selectedDate) {
      newErrors.selectedDate = 'Please select a date' as any;
    }

    if (formData.selectedTimes.length === 0) {
      newErrors.selectedTimes = 'Please select at least one time slot' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await withLoading(async () => {
      await onSubmit(formData);
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      companyName: '',
      jobTitle: '',
      selectedDate: null,
      selectedTimes: [],
      remarks: '',
      ...initialData
    });
    setErrors({});
    setShowCalendar(false);
    setShowTimeSlots(false);
    onClose();
  };

  const formatSelectedDate = () => {
    if (!formData.selectedDate) return '';
    return formData.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSelectedTimeLabels = () => {
    return formData.selectedTimes
      .map((timeValue) => {
        const slot = timeSlots.find((time) => time.value === timeValue);
        return slot ? slot.label : timeValue;
      })
      .join(', ');
  };

  const isFormValid =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.companyName.trim() !== '' &&
    formData.jobTitle.trim() !== '' &&
    formData.selectedDate !== null &&
    formData.selectedTimes.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {title}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* User Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
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
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        errors.name
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
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
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
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
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        errors.companyName
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your company name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
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
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                        errors.jobTitle
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your job title"
                    />
                  </div>
                  {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>}
                </div>
              </div>
            </div>

            {/* Schedule Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h3>
              
              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    setShowTimeSlots(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errors.selectedDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <span
                      className={
                        formData.selectedDate
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }
                    >
                      {formData.selectedDate
                        ? formatSelectedDate()
                        : 'Select a date'}
                    </span>
                  </div>
                </button>
                {/* {errors.selectedDate && <p className="mt-1 text-sm text-red-600">{errors.selectedDate}</p>} */}

                {showCalendar && !showTimeSlots && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <Calendar
                      onChange={handleDateSelect}
                      value={formData.selectedDate}
                      minDate={new Date(Date.now() + 60 * 24 * 60 * 7 * 1000)}
                      maxDate={
                        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                      }
                      tileDisabled={({ date }) => !isDateAvailable(date)}
                      className="react-calendar-custom"
                    />
                  </div>
                )}
              </div>

              {/* Time Selection */}
              {showTimeSlots && formData.selectedDate && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Time Slots
                    </label>
                    {formData.selectedTimes.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {formData.selectedTimes.length} selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    You can select multiple time slots to give us more options
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableTimeSlots(formData.selectedDate).map(
                      (slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => handleTimeSelect(slot.value)}
                          className={`p-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                            formData.selectedTimes.includes(slot.value)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{slot.label}</span>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                  {errors.selectedTimes && <p className="mt-1 text-sm text-red-600">{errors.selectedTimes}</p>}
                </div>
              )}

              {/* Selected Time Summary */}
              {formData.selectedDate &&
                formData.selectedTimes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Selected Meeting Time
                          {formData.selectedTimes.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatSelectedDate()} at {getSelectedTimeLabels()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Any specific topics you'd like to discuss or questions you have..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 border border-gray-300"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleSubmit}
                loading={submitLoading}
                loadingText="Scheduling..."
                disabled={!isFormValid}
                className="flex-1 py-3"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Schedule Call</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .react-calendar-custom {
          width: 100%;
          border: none;
          font-family: inherit;
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
  );
}