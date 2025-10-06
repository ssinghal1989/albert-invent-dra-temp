import React, { useState } from 'react';
import Calendar from 'react-calendar';
import {
  X,
  CalendarIcon,
  Clock,
} from 'lucide-react';
import { LoadingButton } from './LoadingButton';
import { useLoader } from '../../hooks/useLoader';
import 'react-calendar/dist/Calendar.css';

export interface ScheduleCallData {
  selectedDate: Date | null;
  selectedTimes: string[];
  remarks: string;
}

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleCallData) => Promise<void>;
  title?: string;
}

export function ScheduleCallModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Schedule a Call"
}: ScheduleCallModalProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [scheduleData, setScheduleData] = useState<ScheduleCallData>({
    selectedDate: null,
    selectedTimes: [],
    remarks: '',
  });
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

  const handleDateSelect = (data: any) => {
    setScheduleData((prev) => ({
      ...prev,
      selectedDate: data,
      selectedTimes: [],
    }));
    setShowCalendar(false);
    setShowTimeSlots(true);
  };

  const handleTimeSelect = (time: string) => {
    setScheduleData((prev) => {
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

  const handleRemarksChange = (remarks: string) => {
    setScheduleData((prev) => ({ ...prev, remarks }));
  };

  const handleSubmitSchedule = async () => {
    if (!scheduleData.selectedDate || scheduleData.selectedTimes.length === 0) {
      alert('Please select both date and at least one time slot');
      return;
    }

    await withLoading(async () => {
      await onSubmit(scheduleData);
      handleClose();
    });
  };

  const handleClose = () => {
    setScheduleData({
      selectedDate: null,
      selectedTimes: [],
      remarks: '',
    });
    setShowCalendar(false);
    setShowTimeSlots(false);
    onClose();
  };

  const formatSelectedDate = () => {
    if (!scheduleData.selectedDate) return '';
    return scheduleData.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSelectedTimeLabels = () => {
    return scheduleData.selectedTimes
      .map((timeValue) => {
        const slot = timeSlots.find((time) => time.value === timeValue);
        return slot ? slot.label : timeValue;
      })
      .join(', ');
  };

  const isFormValid =
    scheduleData.selectedDate !== null && scheduleData.selectedTimes.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  setShowTimeSlots(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span
                    className={
                      scheduleData.selectedDate
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }
                  >
                    {scheduleData.selectedDate
                      ? formatSelectedDate()
                      : 'Select a date'}
                  </span>
                </div>
              </button>

              {showCalendar && !showTimeSlots && (
                <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <Calendar
                    onChange={handleDateSelect}
                    value={scheduleData.selectedDate}
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
            {showTimeSlots && scheduleData.selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Time Slots
                  </label>
                  {scheduleData.selectedTimes.length > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {scheduleData.selectedTimes.length} selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  You can select multiple time slots to give us more options
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableTimeSlots(scheduleData.selectedDate).map(
                    (slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => handleTimeSelect(slot.value)}
                        className={`p-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
                          scheduleData.selectedTimes.includes(slot.value)
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
              </div>
            )}

            {/* Selected Time Summary */}
            {scheduleData.selectedDate &&
              scheduleData.selectedTimes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Selected Meeting Time
                        {scheduleData.selectedTimes.length > 1 ? 's' : ''}
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
                onClick={handleClose}
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