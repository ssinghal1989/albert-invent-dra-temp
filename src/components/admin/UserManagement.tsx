import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, UserCheck, Building } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

interface UserStats {
  totalUsers: number;
  totalCompanies: number;
  usersWithAssessments: number;
}

export function UserManagement() {
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