import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, UserCheck, Building, Mail, Briefcase, Calendar } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

interface UserStats {
  totalUsers: number;
  totalCompanies: number;
  usersWithAssessments: number;
}

interface User {
  id: string;
  name?: string;
  email: string;
  jobTitle?: string;
  role?: string;
  createdAt: string;
  company?: {
    name?: string;
    primaryDomain: string;
  };
}

export function UserManagement() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalCompanies: 0,
    usersWithAssessments: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: usersLoading, withLoading: withUsersLoading } = useLoader();

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

  const loadUsersList = async () => {
    await withUsersLoading(async () => {
      try {
        const usersResult = await client.models.User.list({
          selectionSet: [
            'id',
            'name',
            'email', 
            'jobTitle',
            'role',
            'createdAt',
            'company.name',
            'company.primaryDomain'
          ]
        });
        
        const sortedUsers = (usersResult.data || []).sort((a, b) => 
          new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()
        );
        
        setUsers(sortedUsers as User[]);
      } catch (error) {
        console.error('Error loading users list:', error);
      }
    });
  };

  const handleToggleUsersList = async () => {
    if (!showUsersList && users.length === 0) {
      await loadUsersList();
    }
    setShowUsersList(!showUsersList);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <LoadingButton
            onClick={loadUserStats}
            loading={statsLoading}
            loadingText="Refreshing..."
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </LoadingButton>
        </div>
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

      {/* Toggle Users List */}
      <div className="mb-4">
        <LoadingButton
          onClick={handleToggleUsersList}
          loading={usersLoading}
          loadingText="Loading Users..."
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>{showUsersList ? 'Hide Users List' : 'Show Users List'}</span>
        </LoadingButton>
      </div>

      {/* Users List */}
      {showUsersList && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {user.name || 'No Name'}
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {user.role || 'user'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                          {user.jobTitle && (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{user.jobTitle}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {user.company && (
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {user.company.name || user.company.primaryDomain}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}