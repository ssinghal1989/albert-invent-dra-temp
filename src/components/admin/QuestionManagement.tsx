import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { seedDataService } from '../../services/seedDataService';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

export function QuestionManagement() {
  const [questionCounts, setQuestionCounts] = useState({ tier1: 0, tier2: 0, total: 0 });
  const { isLoading: countsLoading, withLoading: withCountsLoading } = useLoader();
  const { isLoading: initLoading, withLoading: withInitLoading } = useLoader();

  useEffect(() => {
    loadQuestionCounts();
  }, []);

  const loadQuestionCounts = async () => {
    await withCountsLoading(async () => {
      const result = await seedDataService.getQuestionCounts();
      if (result.success) {
        setQuestionCounts(result.data);
      }
    });
  };

  const handleInitializeQuestions = async () => {
    await withInitLoading(async () => {
      const result = await seedDataService.initializeDefaultQuestions();
      if (result.success) {
        console.log('Questions initialized:', result.data);
        await loadQuestionCounts();
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">Question Management</h2>
      </div>

      {/* Question Counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {countsLoading ? '...' : questionCounts.tier1}
          </div>
          <div className="text-sm text-blue-800">Tier 1 Questions</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {countsLoading ? '...' : questionCounts.tier2}
          </div>
          <div className="text-sm text-green-800">Tier 2 Questions</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {countsLoading ? '...' : questionCounts.total}
          </div>
          <div className="text-sm text-purple-800">Total Questions</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <LoadingButton
          onClick={handleInitializeQuestions}
          loading={initLoading}
          loadingText="Initializing..."
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Initialize Default Questions</span>
        </LoadingButton>

        <LoadingButton
          onClick={loadQuestionCounts}
          loading={countsLoading}
          loadingText="Refreshing..."
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Counts</span>
        </LoadingButton>
      </div>
    </div>
  );
}