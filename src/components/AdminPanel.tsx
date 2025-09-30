import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building, 
  Users, 
  Search, 
  Check, 
  X, 
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { client } from '../amplifyClient';
import { useAppContext } from '../context/AppContext';
import { LoadingButton } from './ui/LoadingButton';
import { Loader } from './ui/Loader';
import { useToast } from '../context/ToastContext';

interface Company {
  id: string;
  name: string;
  primaryDomain: string;
  config: string;
  createdAt: string;
  users?: any[];
}

export function AdminPanel() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingCompany, setUpdatingCompany] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = state.userData?.role === 'admin' || state.userData?.role === 'superAdmin';

  useEffect(() => {
    if (isAdmin) {
      fetchCompanies();
    }
  }, [isAdmin]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Company.list();

      console.log('data', data);
      
      // Fetch users for each company
      const companiesWithUsers = await Promise.all(
        (data || []).map(async (company) => {
          const users = await company.users();
          console.log('users', users)
          return {
            ...company,
            users: users.data || []
          };
        })
      );
      
      setCompanies(companiesWithUsers as Company[]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load companies'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyTier2Access = async (companyId: string, enabled: boolean) => {
    try {
      setUpdatingCompany(companyId);
      
      const company = companies.find(c => c.id === companyId);
      if (!company) return;

      const currentConfig = company.config ? JSON.parse(company.config) : {};
      const updatedConfig = {
        ...currentConfig,
        tier2AccessEnabled: enabled
      };

      const { data } = await client.models.Company.update({
        id: companyId,
        config: JSON.stringify(updatedConfig)
      });

      if (data) {
        // Update local state
        setCompanies(prev => 
          prev.map(c => 
            c.id === companyId 
              ? { ...c, config: JSON.stringify(updatedConfig) }
              : c
          )
        );

        showToast({
          type: 'success',
          title: 'Access Updated',
          message: `Tier 2 access ${enabled ? 'enabled' : 'disabled'} for ${company.name}`
        });
      }
    } catch (error) {
      console.error('Error updating company access:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update company access'
      });
    } finally {
      setUpdatingCompany(null);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 text-lg">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage company access and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="text-2xl font-bold text-primary">{companies.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies by name or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchCompanies}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Companies List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Companies</h2>
            <p className="text-gray-600">Manage Tier 2 assessment access for companies</p>
          </div>

          {loading ? (
            <div className="p-8">
              <Loader text="Loading companies..." size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <div className="p-8 text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No companies found</p>
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const config = company.config ? JSON.parse(company.config) : {};
                  const hasTier2Access = config.tier2AccessEnabled === true;
                  
                  return (
                    <div key={company.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {company.name || 'Unnamed Company'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{company.primaryDomain}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{company.users?.length || 0} users</span>
                              </div>
                              <span>•</span>
                              <span>Created {new Date(company.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Tier 2 Access Status */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Tier 2 Access:</span>
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                              hasTier2Access 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {hasTier2Access ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Enabled</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" />
                                  <span>Disabled</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Toggle Button */}
                          <LoadingButton
                            onClick={() => updateCompanyTier2Access(company.id, !hasTier2Access)}
                            loading={updatingCompany === company.id}
                            loadingText="Updating..."
                            variant={hasTier2Access ? 'outline' : 'primary'}
                            size="sm"
                          >
                            {hasTier2Access ? 'Disable' : 'Enable'}
                          </LoadingButton>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}