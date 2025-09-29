import {
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useLoader } from "../hooks/useLoader";
import { getMaturityLevel, getScoreColor } from "../utils/common";
import { generateRecommendations } from "../utils/recommendationsGenerator";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { LoadingButton } from "./ui/LoadingButton";
import { client } from "../amplifyClient";
import { useAppContext } from "../context/AppContext";
import { useAssessment } from "../hooks/useAssesment";
import { useToast } from "../context/ToastContext";
import { useCallRequest } from "../hooks/useCallRequest";

interface Tier1ResultsProps {
  score: Tier1ScoreResult;
  onNavigateToTier2: () => void;
  onScheduleCall: (data: ScheduleCallData) => void;
  onRetakeAssessment: () => void;
}

export interface ScheduleCallData {
  selectedDate: Date | null;
  selectedTimes: string[];
  remarks: string;
}
export function Tier1Results({
  score,
  onNavigateToTier2,
  onScheduleCall,
  onRetakeAssessment,
}: Tier1ResultsProps) {
  const { isLoading: submitLoading, withLoading } = useLoader();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleCallData>({
    selectedDate: null,
    selectedTimes: [],
    remarks: "",
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const { state } = useAppContext();
  const { userTier1Assessments } = useAssessment();
  const { showToast } = useToast();
  const {scheduleRequest} = useCallRequest();

  const getRecommendations = (score: number): string[] => {
    if (score >= 85) {
      return [
        "Continue to innovate and lead in digital transformation",
        "Share best practices across the organization",
        "Explore advanced AI and automation opportunities",
      ];
    }
    if (score >= 70) {
      return [
        "Focus on scaling successful digital initiatives",
        "Strengthen data governance and integration",
        "Invest in advanced analytics capabilities",
      ];
    }
    if (score >= 50) {
      return [
        "Prioritize foundational digital infrastructure",
        "Develop digital skills across teams",
        "Establish clear data governance frameworks",
      ];
    }
    return [
      "Begin with basic digital transformation initiatives",
      "Focus on data standardization and integration",
      "Build digital culture and leadership support",
    ];
  };

  const maturityLevel = getMaturityLevel(score.overallScore);
  const scoreColor = getScoreColor(score.overallScore);
  const recommendations = score?.pillarScores
    ? generateRecommendations(score)
    : getRecommendations(score.overallScore);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18; // Changed to 18 to include 6PM (18:00)

    for (let hour = startHour; hour <= endHour; hour++) {
      // For the last hour (6PM), only add the top of the hour slot
      const maxMinute = hour === endHour ? 0 : 30;
      for (let minute = 0; minute <= maxMinute; minute += 30) {
        const time24 = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const time12 = `${hour12}:${minute
          .toString()
          .padStart(2, "0")} ${ampm}`;

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
    const unavailableSlots = ["10:00", "14:30", "15:30"];

    return timeSlots.filter((slot) => !unavailableSlots.includes(slot.value));
  };

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setScheduleData({
      selectedDate: null,
      selectedTimes: [],
      remarks: "",
    });
    setShowCalendar(false);
    setShowTimeSlots(false);
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
        // Remove time if already selected
        newTimes = currentTimes.filter((t) => t !== time);
      } else {
        // Add time if not selected
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
      alert("Please select both date and at least one time slot");
      return;
    }

    await withLoading(async () => {
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1500));

      // Call the parent callback
      // onScheduleCall(scheduleData);

      try {
        const { data, errors } = await scheduleRequest({
          preferredDate: new Date(scheduleData?.selectedDate!)
            .toISOString()
            .split("T")[0]!,
          preferredTimes: scheduleData.selectedTimes,
          initiatorUserId: state.userData?.id,
          companyId: state.company?.id,
          status: "PENDING",
          type: "TIER1_FOLLOWUP",
          remarks: scheduleData.remarks,
          assessmentInstanceId: userTier1Assessments?.[0]?.id,
          metadata: JSON.stringify({
            userEmail: state.userData?.email!,
            userName: state.userData?.name!,
            companyDomain: state.company?.primaryDomain!,
            companyName: state.company?.name!,
            userJobTitle: state.userData?.jobTitle!,
            assessmentScore: score.overallScore,
          }),
        });

        if (data) {
          // Show success toast
          showToast({
            type: "success",
            title: "Follow-up Call Requested!",
            message:
              "We've received your request and will contact you soon to schedule your follow-up call.",
            duration: 6000,
          });
          // Close modal
          handleCloseModal();
        } else {
          showToast({
            type: "error",
            title: "Request Failed",
            message: "Failed to schedule the call. Please try again.",
            duration: 5000,
          });
        }
      } catch (err) {
        showToast({
          type: "error",
          title: "Request Failed",
          message: "Failed to schedule the call. Please try again.",
          duration: 5000,
        });
      }
    });
  };

  const formatSelectedDate = () => {
    if (!scheduleData.selectedDate) return "";
    return scheduleData.selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSelectedTimeLabels = () => {
    return scheduleData.selectedTimes
      .map((timeValue) => {
        const slot = timeSlots.find((time) => time.value === timeValue);
        return slot ? slot.label : timeValue;
      })
      .join(", ");
  };

  const isFormValid =
    scheduleData.selectedDate !== null && scheduleData.selectedTimes.length > 0;

  // Calculate circle properties for animated progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (score.overallScore / 100) * circumference;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Digital Readiness Score
            </h1>
            <p className="text-gray-600 text-lg">Here's where you stand</p>
          </div>

          {/* Score Circle and Details */}
          <div className="flex justify-center mb-12">
            {/* Score Visualization */}
            <div>
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
                      animation: "drawCircle 2s ease-out forwards",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="text-6xl font-bold"
                    style={{ color: scoreColor }}
                  >
                    {score.overallScore}
                  </div>
                  <div className="text-gray-500 text-lg font-medium mt-1">
                    {maturityLevel}
                  </div>
                  <div className="text-gray-400 text-sm">(Maturity Level)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Assessment Summary
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">
                  Digital Readiness Level
                </span>
                <span
                  className="font-bold text-xl"
                  style={{ color: scoreColor }}
                >
                  {maturityLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${score.overallScore}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>
              <div className="relative text-sm text-gray-500 mt-2">
                <span
                  className="absolute text-xs"
                  style={{ left: "12.5%", transform: "translateX(-50%)" }}
                >
                  Basic
                </span>
                <span
                  className="absolute text-xs"
                  style={{ left: "37.5%", transform: "translateX(-50%)" }}
                >
                  Emerging
                </span>
                <span
                  className="absolute text-xs"
                  style={{ left: "62.5%", transform: "translateX(-50%)" }}
                >
                  Established
                </span>
                <span
                  className="absolute text-xs whitespace-nowrap"
                  style={{ left: "87.5%", transform: "translateX(-50%)" }}
                >
                  World Class
                </span>
              </div>
            </div>
          </div>

          {/* Priority Recommendation */}
          {recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Priority Focus Area
              </h3>
              <div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 max-w-4xl mx-auto"
                style={{ borderColor: "#05f" }}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: scoreColor }}
                  >
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Key Priority
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {recommendations[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Focus Area Recommendations */}
          {recommendations.length > 1 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Focus Area Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                {recommendations.slice(1).map((recommendation, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ backgroundColor: scoreColor }}
                      >
                        <span className="text-white text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed flex-1">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleScheduleClick}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-white py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: "#05f" }}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Schedule a follow-up call</span>
            </button>

            <button
              onClick={onNavigateToTier2}
              className="flex items-center justify-center space-x-2 text-white py-4 px-8 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200"
              style={{ backgroundColor: "#05f" }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Request In-Depth Assessment</span>
            </button>

            <button
              onClick={onRetakeAssessment}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              This assessment provides a high-level overview. For detailed
              insights and strategic planning, consider our Tier 2 in-depth
              assessment.
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule a Call
                </h2>
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
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span
                        className={
                          scheduleData.selectedDate
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {scheduleData.selectedDate
                          ? formatSelectedDate()
                          : "Select a date"}
                      </span>
                    </div>
                  </button>

                  {showCalendar && !showTimeSlots && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <Calendar
                        onChange={handleDateSelect}
                        value={scheduleData.selectedDate}
                        minDate={new Date()}
                        maxDate={
                          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                        } // 60 days from now
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
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50"
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
                            {scheduleData.selectedTimes.length > 1 ? "s" : ""}
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

      <style>{`
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
