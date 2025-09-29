import React from 'react';
import { useState } from 'react';
import Calendar from 'react-calendar';
import { TrendingUp, Calendar, ArrowRight, BarChart3 } from 'lucide-react';
import { X, Clock } from 'lucide-react';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';
import 'react-calendar/dist/Calendar.css';

interface Tier1ResultsProps {
  score: number;
  onNavigateToTier2: () => void;
  onScheduleCall: () => void;
  onRetakeAssessment: () => void;
}

interface ScheduleCallData {
  selectedDate: Date | null;
  selectedTime: string;
  remarks: string;
}
export function Tier1Results({ score, onNavigateToTier2, onScheduleCall, onRetakeAssessment }: Tier1ResultsProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleCallData>({
    selectedDate: null,
    selectedTime: '',
    remarks: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const getMaturityLevel = (score: number): string => {
    if (score >= 85) return 'World Class';
    if (score >= 70) return 'Established';
    if (score >= 50) return 'Emerging';
    return 'Basic';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#05f'; // primary
    if (score >= 70) return '#088aff'; // accent
    if (score >= 50) return '#374151'; // secondary
    return '#6b7280'; // gray-500
  };

  const getRecommendations = (score: number): string[] => {
    if (score >= 85) {
      return [
        'Continue to innovate and lead in digital transformation',
        'Share best practices across the organization',
        'Explore advanced AI and automation opportunities'
      ];
    }
    if (score >= 70) {
      return [
        'Focus on scaling successful digital initiatives',
        'Strengthen data governance and integration',
        'Invest in advanced analytics capabilities'
      ];
    }
    if (score >= 50) {
      return [
        'Prioritize foundational digital infrastructure',
        'Develop digital skills across teams',
        'Establish clear data governance frameworks'
      ];
    }
    return [
      'Begin with basic digital transformation initiatives',
      'Focus on data standardization and integration',
      'Build digital culture and leadership support'
    ];
  };

  const maturityLevel = getMaturityLevel(score);
  const scoreColor = getScoreColor(score);
  const recommendations = getRecommendations(score);

  // Generate time slots
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

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date | null) => {
    if (!date) return [];
    
    // Simulate some unavailable slots based on date
    const unavailableSlots = ['10:00', '14:30', '15:30'];
    
    return timeSlots.filter(slot => !unavailableSlots.includes(slot.value));
  };

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setScheduleData({
      selectedDate: null,
      selectedTime: '',
      remarks: ''
    });
    setShowCalendar(false);
    setShowTimeSlots(false);
  };

  const handleDateSelect = (date: Date) => {
    setScheduleData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
    setShowCalendar(false);
    setShowTimeSlots(true);
  };

  const handleTimeSelect = (time: string) => {
    setScheduleData(prev => ({ ...prev, selectedTime: time }));
  };

  const handleRemarksChange = (remarks: string) => {
    setScheduleData(prev => ({ ...prev, remarks }));
  };

  const handleSubmitSchedule = async () => {
    if (!scheduleData.selectedDate || !scheduleData.selectedTime) {
      alert('Please select both date and time');
      return;
    }

    await withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the parent callback
      onScheduleCall();
      
      // Close modal
      handleCloseModal();
    });
  };

  const formatSelectedDate = () => {
    if (!scheduleData.selectedDate) return '';
    return scheduleData.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSelectedTimeLabel = () => {
    const selectedTime = timeSlots.find(time => time.value === scheduleData.selectedTime);
    return selectedTime ? selectedTime.label : '';
  };

  const isFormValid = scheduleData.selectedDate !== null && scheduleData.selectedTime !== '';

  // Calculate circle properties for animated progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Digital Readiness Score</h1>
            <p className="text-gray-600 text-lg">Here's where you stand</p>
          </div>

          {/* Score Circle and Details */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Score Visualization */}
            <div className="flex justify-center">
              <div className="relative">
                <svg width="280" height="280" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke={scoreColor}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      animation: 'drawCircle 2s ease-out forwards'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold" style={{ color: scoreColor }}>
                    {score}
                  </div>
                  <div className="text-gray-500 text-lg font-medium mt-1">
                    {maturityLevel}
                  </div>
                  <div className="text-gray-400 text-sm">
                    (Maturity Level)
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Summary</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Digital Readiness Level</span>
                    <span className="font-bold text-xl" style={{ color: scoreColor }}>
                      {maturityLevel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: scoreColor
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Basic</span>
                    <span>Emerging</span>
                    <span>Established</span>
                    <span>World Class</span>
                  </div>
                </div>
              </div>

              {/* Key Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: scoreColor }}
                      >
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={handleScheduleClick}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span>Set up a Call to Discuss</span>
            </button>

            <button
              onClick={onNavigateToTier2}
              className="flex items-center justify-center space-x-2 text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200"
              style={{ backgroundColor: '#05f' }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Begin Tier 2 Assessment</span>
            </button>

            <button
              onClick={onRetakeAssessment}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              This assessment provides a high-level overview. For detailed insights and strategic planning, 
              consider our Tier 2 in-depth assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule a Call</h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className={scheduleData.selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                        {scheduleData.selectedDate ? formatSelectedDate() : 'Select a date'}
                      </span>
                    </div>
                  </button>
                  
                  {showCalendar && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <Calendar
                        onChange={handleDateSelect}
                        value={scheduleData.selectedDate}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)} // 60 days from now
                        tileDisabled={({ date }) => !isDateAvailable(date)}
                        className="react-calendar-custom"
                      />
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                {showTimeSlots && scheduleData.selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {getAvailableTimeSlots(scheduleData.selectedDate).map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => handleTimeSelect(slot.value)}
                          className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                            scheduleData.selectedTime === slot.value
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{slot.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Time Summary */}
                {scheduleData.selectedDate && scheduleData.selectedTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Selected Meeting Time</p>
                        <p className="text-sm text-gray-600">
                          {formatSelectedDate()} at {getSelectedTimeLabel()}
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
                    value={scheduleData.remarks}
                    onChange={(e) => handleRemarksChange(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Any specific topics you'd like to discuss or questions you have..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleSubmitSchedule}
                    loading={submitLoading}
                    loadingText="Scheduling..."
                    disabled={!isFormValid}
                    className="flex-1 py-3"
                  >
                    Schedule Call
                  </LoadingButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }
      `}</style>
    </main>
  );
}