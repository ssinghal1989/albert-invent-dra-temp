import React, { useState, useEffect } from 'react';
import { Shield, FileText, Users, BarChart3, Info, RefreshCw, Plus, Database, Cloud, Settings, UserCheck, Building, TrendingUp, CheckCircle } from 'lucide-react';
import { ProtectedRoute } from './ProtectedRoute';
import { seedDataService } from '../services/seedDataService';
import { client } from '../amplifyClient';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';

// Admin Header Component
function AdminHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-600 text-lg">Manage assessments and system data</p>
    </div>
  );
}

// Question Management Component
function QuestionManagement() {
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

// User Management Component
interface UserStats {
  totalUsers: number;
  totalCompanies: number;
  usersWithAssessments: number;
}

function UserManagement() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalCompanies: 0,
    usersWithAssessments: 0
  });
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    await withStatsLoading(async () => {
      try {
        // Get total users
        const usersResult = await client.models.User.list();
        const totalUsers = usersResult.data?.length || 0;

        // Get total companies
        const companiesResult = await client.models.Company.list();
        const totalCompanies = companiesResult.data?.length || 0;

        // Get users with assessments
        const assessmentsResult = await client.models.AssessmentInstance.list();
        const uniqueUserIds = new Set(
          assessmentsResult.data?.map(assessment => assessment.initiatorUserId).filter(Boolean)
        );
        const usersWithAssessments = uniqueUserIds.size;

        setUserStats({
          totalUsers,
          totalCompanies,
          usersWithAssessments
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : userStats.totalUsers}
          </div>
          <div className="text-sm text-blue-800">Total Users</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Building className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : userStats.totalCompanies}
          </div>
          <div className="text-sm text-green-800">Total Companies</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statsLoading ? '...' : userStats.usersWithAssessments}
          </div>
          <div className="text-sm text-purple-800">Users with Assessments</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <LoadingButton
          onClick={loadUserStats}
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

// Assessment Management Component
interface AssessmentStats {
  totalAssessments: number;
  tier1Assessments: number;
  tier2Assessments: number;
  completedAssessments: number;
}

function AssessmentManagement() {
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

// System Info Component
function SystemInfo() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Info className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-gray-900">System Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Database</span>
          </div>
          <p className="text-sm text-gray-600">AWS DynamoDB</p>
          <p className="text-xs text-green-600 mt-1">Connected</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Cloud className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">API</span>
          </div>
          <p className="text-sm text-gray-600">AWS AppSync</p>
          <p className="text-xs text-green-600 mt-1">Active</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Environment</span>
          </div>
          <p className="text-sm text-gray-600">Production</p>
          <p className="text-xs text-blue-600 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <AdminHeader />
            
            <div className="space-y-8">
              <QuestionManagement />
              <UserManagement />
              <AssessmentManagement />
              <SystemInfo />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}