import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, TrendingUp, CheckCircle } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

interface AssessmentStats {
  totalAssessments: number;
  tier1Assessments: number;
  tier2Assessments: number;
  completedAssessments: number;
}

export function AssessmentManagement() {
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats>({
    totalAssessments: 0,
    tier1Assessments: 0,
    tier2Assessments: 0,
    completedAssessments: 0
  });
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();

  useEffect(() => {
    loadAssessmentStats();
  }, []);

  const loadAssessmentStats = async () => {
    await withStatsLoading(async () => {
      try {
        const assessmentsResult = await client.models.AssessmentInstance.list();
        const assessments = assessmentsResult.data || [];

        const totalAssessments = assessments.length;
        const tier1Assessments = assessments.filter(a => a.assessmentType === 'TIER1').length;
        const tier2Assessments = assessments.filter(a => a.assessmentType === 'TIER2').length;
        const completedAssessments = assessments.filter(a => a.submittedAt).length;

        setAssessmentStats({
          totalAssessments,
          tier1Assessments,
          tier2Assessments,
          completedAssessments
        });
      } catch (error) {
        console.error('Error loading assessment stats:', error);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">Assessment Management</h2>
      </div>

      {/* Assessment Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : assessmentStats.totalAssessments}
          </div>
          <div className="text-sm text-blue-800">Total Assessments</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : assessmentStats.tier1Assessments}
          </div>
          <div className="text-sm text-green-800">Tier 1</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statsLoading ? '...' : assessmentStats.tier2Assessments}
          </div>
          <div className="text-sm text-purple-800">Tier 2</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? '...' : assessmentStats.completedAssessments}
          </div>
          <div className="text-sm text-orange-800">Completed</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <LoadingButton
          onClick={loadAssessmentStats}
          loading={statsLoading}
          loadingText="Refreshing..."
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stats</span>
        </LoadingButton>
      </div>
    </div>
  );
}