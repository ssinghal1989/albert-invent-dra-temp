import React from 'react';
import { Calendar, TrendingUp, Save, BarChart3 } from 'lucide-react';

interface ActionButtonsProps {
  isLoggedIn: boolean;
  onScheduleClick: () => void;
  onNavigateToTier2: () => void;
  onSignUpToSave: () => void;
  onRetakeAssessment: () => void;
}

export function ActionButtons({
  isLoggedIn,
  onScheduleClick,
  onNavigateToTier2,
  onSignUpToSave,
  onRetakeAssessment
}: ActionButtonsProps) {
  return (
    <div className="mb-8">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLoggedIn ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 max-w-5xl mx-auto`}>
        <button
          onClick={onScheduleClick}
          className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
          style={{ backgroundColor: "#05f" }}
        >
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <span className="leading-tight">Schedule a follow-up call</span>
        </button>

        <button
          onClick={onNavigateToTier2}
          className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
          style={{ backgroundColor: "#05f" }}
        >
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          <span className="leading-tight">Request In-Depth Assessment</span>
        </button>

        {!isLoggedIn && (
          <button
            onClick={onSignUpToSave}
            className="flex items-center justify-center space-x-2 text-white py-4 px-4 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 text-center"
            style={{ backgroundColor: "#05f" }}
          >
            <Save className="w-5 h-5 flex-shrink-0" />
            <span className="leading-tight">Sign up to save your results</span>
          </button>
        )}

        <button
          onClick={onRetakeAssessment}
          className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 text-center"
        >
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          <span className="leading-tight">Retake Assessment</span>
        </button>
      </div>
    </div>
  );
}