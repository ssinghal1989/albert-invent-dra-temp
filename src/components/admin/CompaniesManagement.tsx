import React, { useState, useEffect } from 'react';
import { Building, RefreshCw, Users, BarChart3, Calendar, Globe } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

interface CompanyStats {
  totalCompanies: number;
  companiesWithUsers: number;
  companiesWithAssessments: number;
  averageUsersPerCompany: number;
}

interface Company {
  id: string;
  name?: string;
  primaryDomain: string;
  createdAt: string;
  config?: string;
  userCount?: number;
  assessmentCount?: number;
}

export function CompaniesManagement() {
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalCompanies: 0,
    companiesWithUsers: 0,
    companiesWithAssessments: 0,
    averageUsersPerCompany: 0
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompaniesList, setShowCompaniesList] = useState(false);
  
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: companiesLoading, withLoading: withCompaniesLoading } = useLoader();

  useEffect(() => {
    loadCompanyStats();
  }, []);

  const loadCompanyStats = async () => {
    await withStatsLoading(async () => {
      try {
        // Get all companies
        const companiesResult = await client.models.Company.list();
        const companies = companiesResult.data || [];
        const totalCompanies = companies.length;

        // Get users to calculate company stats
        const usersResult = await client.models.User.list();
        const users = usersResult.data || [];
        
        // Get assessments to calculate company stats
        const assessmentsResult = await client.models.AssessmentInstance.list();
        const assessments = assessmentsResult.data || [];

        // Calculate companies with users
        const companiesWithUsers = new Set(
          users.map(user => user.companyId).filter(Boolean)
        ).size;

        // Calculate companies with assessments
        const companiesWithAssessments = new Set(
          assessments.map(assessment => assessment.companyId).filter(Boolean)
        ).size;

        // Calculate average users per company
        const averageUsersPerCompany = totalCompanies > 0 
          ? Math.round((users.length / totalCompanies) * 10) / 10 
          : 0;

        setCompanyStats({
          totalCompanies,
          companiesWithUsers,
          companiesWithAssessments,
          averageUsersPerCompany
        });
      } catch (error) {
        console.error('Error loading company stats:', error);
      }
    });
  };

  const loadCompaniesList = async () => {
    await withCompaniesLoading(async () => {
      try {
        const companiesResult = await client.models.Company.list({
          selectionSet: [
            'id',
            'name',
            'primaryDomain',
            'createdAt',
            'config'
          ]
        });
        
        // Get user counts for each company
        const usersResult = await client.models.User.list();
        const assessmentsResult = await client.models.AssessmentInstance.list();
        
        const userCounts = (usersResult.data || []).reduce((acc, user) => {
          if (user.companyId) {
            acc[user.companyId] = (acc[user.companyId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const assessmentCounts = (assessmentsResult.data || []).reduce((acc, assessment) => {
          if (assessment.companyId) {
            acc[assessment.companyId] = (acc[assessment.companyId] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        
        const companiesWithCounts = (companiesResult.data || []).map(company => ({
          ...company,
          userCount: userCounts[company.id] || 0,
          assessmentCount: assessmentCounts[company.id] || 0
        })).sort((a, b) => 
          new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()
        );
        
        setCompanies(companiesWithCounts as Company[]);
      } catch (error) {
        console.error('Error loading companies list:', error);
      }
    });
  };

  const handleToggleCompaniesList = async () => {
    if (!showCompaniesList && companies.length === 0) {
      await loadCompaniesList();
    }
    setShowCompaniesList(!showCompaniesList);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Companies Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <LoadingButton
            onClick={loadCompanyStats}
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

      {/* Company Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : companyStats.totalCompanies}
          </div>
          <div className="text-sm text-blue-800">Total Companies</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : companyStats.companiesWithUsers}
          </div>
          <div className="text-sm text-green-800">With Users</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statsLoading ? '...' : companyStats.companiesWithAssessments}
          </div>
          <div className="text-sm text-purple-800">With Assessments</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? '...' : companyStats.averageUsersPerCompany}
          </div>
          <div className="text-sm text-orange-800">Avg Users/Company</div>
        </div>
      </div>

      {/* Toggle Companies List */}
      <div className="mb-4">
        <LoadingButton
          onClick={handleToggleCompaniesList}
          loading={companiesLoading}
          loadingText="Loading Companies..."
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Building className="w-4 h-4" />
          <span>{showCompaniesList ? 'Hide Companies List' : 'Show Companies List'}</span>
        </LoadingButton>
      </div>

      {/* Companies List */}
      {showCompaniesList && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Companies</h3>
          {companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No companies found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {companies.map((company) => (
                <div key={company.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {company.name || 'No Name'}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{company.primaryDomain}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {company.userCount || 0} users
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {company.assessmentCount || 0} assessments
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Created {new Date(company.createdAt).toLocaleDateString()}
                          </span>
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