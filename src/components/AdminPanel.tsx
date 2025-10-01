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
  CheckCircle,
  Calendar,
  Phone,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  BarChart3
} from 'lucide-react';
import { client } from '../amplifyClient';
import { useAppContext } from '../context/AppContext';
import { LoadingButton } from './ui/LoadingButton';
import { Loader } from './ui/Loader';
import { useToast } from '../context/ToastContext';
import { questionsService } from '../services/questionsService';
import { Tier1TemplateId } from '../services/defaultQuestions';

interface Company {
  id: string;
  name: string;
  primaryDomain: string;
  config: string;
  createdAt: string;
  users?: any[];
}

interface CallRequest {
  id: string;
  type: 'TIER1_FOLLOWUP' | 'TIER2_REQUEST';
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  preferredDate: string;
  preferredTimes: string[];
  remarks?: string;
  metadata: string;
  createdAt: string;
  initiator?: any;
  company?: any;
}

type AdminView = 'companies' | 'callRequests';

export function AdminPanel() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<AdminView>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingCompany, setUpdatingCompany] = useState<string | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedCallRequests, setExpandedCallRequests] = useState<Set<string>>(new Set());
  const [tier1Questions, setTier1Questions] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<Record<string, any>>({});

  // Check if current user is admin
  const isAdmin = state.userData?.role === 'admin' || state.userData?.role === 'superAdmin';

  useEffect(() => {
    if (isAdmin) {
      if (currentView === 'companies') {
        fetchCompanies();
      } else {
        fetchCallRequests();
        loadTier1Questions();
      }
    }
  }, [isAdmin, currentView]);

  const loadTier1Questions = async () => {
    try {
      const result = await questionsService.getQuestionsByTemplate(Tier1TemplateId);
      if (result.success && result.data) {
        const sortedQuestions = result.data.sort((a, b) => a.order - b.order);
        setTier1Questions(sortedQuestions);
      }
    } catch (error) {
      console.error('Error loading Tier 1 questions:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Company.list();
      
      // Fetch users for each company
      const companiesWithUsers = await Promise.all(
        (data || []).map(async (company) => {
          const users = await company.users();
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

  const fetchCallRequests = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.ScheduleRequest.list();
      
      // Fetch related data for each request
      const requestsWithDetails = await Promise.all(
        (data || []).map(async (request) => {
          const initiator = await request.initiator();
          const company = await request.company();
          return {
            ...request,
            initiator: initiator.data,
            company: company.data
          };
        })
      );
      
      // Sort by creation date (newest first)
      const sortedRequests = requestsWithDetails.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setCallRequests(sortedRequests as CallRequest[]);
    } catch (error) {
      console.error('Error fetching call requests:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load call requests'
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

  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const toggleCallRequestExpansion = (requestId: string) => {
    setExpandedCallRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TIER1_FOLLOWUP': return 'bg-purple-100 text-purple-800';
      case 'TIER2_REQUEST': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimes = (times: string[]) => {
    return times.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }).join(', ');
  };

  const getSortedOptions = (question: any) => {
    const maturityOrder = ["BASIC", "EMERGING", "ESTABLISHED", "WORLD_CLASS"];
    const sortedOptions = question.options.sort((a: any, b: any) => {
      const aIndex = maturityOrder.indexOf(a.value);
      const bIndex = maturityOrder.indexOf(b.value);
      return aIndex - bIndex;
    });
    return sortedOptions;
  };

  const getMaturityLabels = () => {
    const maturityOrder = ["BASIC", "EMERGING", "ESTABLISHED", "WORLD_CLASS"];
    if (tier1Questions.length > 0 && tier1Questions[0].options) {
      const maturityLevels = maturityOrder.filter((level) =>
        tier1Questions[0].options.some((opt: any) => opt.value === level)
      );
      return maturityLevels.map((level) =>
        level
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase())
      );
    }
    return [];
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCallRequests = callRequests.filter(request => {
    const metadata = request.metadata ? JSON.parse(request.metadata) : {};
    return (
      metadata.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage companies, users, and call requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Companies</p>
                <p className="text-2xl font-bold text-primary">{companies.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Call Requests</p>
                <p className="text-2xl font-bold text-primary">{callRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('companies')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                currentView === 'companies'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Companies</span>
            </button>
            <button
              onClick={() => setCurrentView('callRequests')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                currentView === 'callRequests'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Requests</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={currentView === 'companies' ? "Search companies..." : "Search call requests..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={currentView === 'companies' ? fetchCompanies : fetchCallRequests}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {currentView === 'companies' ? 'Companies Management' : 'Call Requests'}
            </h2>
            <p className="text-gray-600">
              {currentView === 'companies' 
                ? 'Manage company settings and view associated users'
                : 'View and manage all call requests from users'
              }
            </p>
          </div>

          {loading ? (
            <div className="p-8">
              <Loader text={`Loading ${currentView}...`} size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentView === 'companies' ? (
                // Companies View
                filteredCompanies.length === 0 ? (
                  <div className="p-8 text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No companies found</p>
                  </div>
                ) : (
                  filteredCompanies.map((company) => {
                    const config = company.config ? JSON.parse(company.config) : {};
                    const hasTier2Access = config?.tier2AccessEnabled === true;
                    const isExpanded = expandedCompanies.has(company.id);
                    
                    return (
                      <div key={company.id} className="p-6">
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
                                <span>Created {formatDate(company.createdAt)}</span>
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

                            {/* Expand Button */}
                            <button
                              onClick={() => toggleCompanyExpansion(company.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded User Details */}
                        {isExpanded && company.users && company.users.length > 0 && (
                          <div className="mt-4 pl-16">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Associated Users:</h4>
                            <div className="space-y-2">
                              {company.users.map((user: any) => (
                                <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                      <span className="font-medium text-gray-900">{user.name || 'No name'}</span>
                                      <span className="text-sm text-gray-500">{user.email}</span>
                                      {user.jobTitle && (
                                        <>
                                          <span className="text-gray-300">•</span>
                                          <span className="text-sm text-gray-500">{user.jobTitle}</span>
                                        </>
                                      )}
                                      {user.role && (
                                        <>
                                          <span className="text-gray-300">•</span>
                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            user.role === 'admin' || user.role === 'superAdmin'
                                              ? 'bg-purple-100 text-purple-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {user.role}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                // Call Requests View
                filteredCallRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No call requests found</p>
                  </div>
                ) : (
                  filteredCallRequests.map((request) => {
                    const metadata = request.metadata ? JSON.parse(request.metadata) : {};
                    
                    return (
                      <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Phone className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {metadata.userName || 'Unknown User'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                                  {request.type === 'TIER1_FOLLOWUP' ? 'Tier 1 Follow-up' : 'Tier 2 Assessment'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{metadata.userEmail || 'No email'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Building className="w-4 h-4" />
                                    <span>{metadata.companyName || 'No company'}</span>
                                  </div>
                                  {metadata.userJobTitle && (
                                    <div className="flex items-center space-x-2">
                                      <Briefcase className="w-4 h-4" />
                                      <span>{metadata.userJobTitle}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Preferred: {formatDate(request.preferredDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTimes(request.preferredTimes)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Requested: {formatDate(request.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              {request.remarks && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Remarks:</strong> {request.remarks}
                                  </p>
                                </div>
                              )}

                              {metadata.assessmentScore && (
                                <div className="mt-3">
                                  <span className="text-sm text-gray-600">
                                    Assessment Score: 
                                    <span className="ml-1 font-semibold text-primary">
                                      {metadata.assessmentScore}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}