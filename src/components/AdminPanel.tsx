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
  assessmentInstanceId?: any;
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
  const [assessmentInstances, setAssessmentInstances] = useState<Record<string, any>>({});
  const [loadingAssessment, setLoadingAssessment] = useState<string | null>(null);
  const [callRequestFilter, setCallRequestFilter] = useState<'ALL' | 'TIER1_FOLLOWUP' | 'TIER2_REQUEST'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
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

  const fetchAssessmentInstance = async (assessmentInstanceId: string) => {
    try {
      setLoadingAssessment(assessmentInstanceId);
      const { data } = await client.models.AssessmentInstance.get({
        id: assessmentInstanceId
      });
      
      if (data) {
        setAssessmentInstances(prev => ({
          ...prev,
          [assessmentInstanceId]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching assessment instance:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load assessment data'
      });
    } finally {
      setLoadingAssessment(null);
    }
  };

  const handleViewAssessment = async (requestId: string, assessmentInstanceId: string) => {
    const isExpanded = expandedCallRequests.has(requestId);
    
    if (!isExpanded) {
      // Expanding - fetch assessment data if not already loaded
      if (!assessmentInstances[assessmentInstanceId]) {
        await fetchAssessmentInstance(assessmentInstanceId);
      }
    }
    
    // Toggle expansion
    toggleCallRequestExpansion(requestId);
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
    const matchesSearch = (
      metadata.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metadata.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = callRequestFilter === 'ALL' || request.type === callRequestFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCallRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCallRequests = filteredCallRequests.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [callRequestFilter, searchTerm]);

  if (!isAdmin) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600 text-sm sm:text-base">Manage companies, users, and call requests</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-6 sm:space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Companies</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{companies.length}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Requests</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{callRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('companies')}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-4 rounded-md font-medium transition-colors duration-200 text-sm sm:text-base ${
                currentView === 'companies'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building className="w-4 h-4 flex-shrink-0" />
              <span>Companies</span>
            </button>
            <button
              onClick={() => setCurrentView('callRequests')}
              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-4 rounded-md font-medium transition-colors duration-200 text-sm sm:text-base ${
                currentView === 'callRequests'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Call Requests</span>
              <span className="sm:hidden">Requests</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={currentView === 'companies' ? "Search companies..." : "Search call requests..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            {/* Filter for Call Requests */}
            {currentView === 'callRequests' && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</span>
                <select
                  value={callRequestFilter}
                  onChange={(e) => setCallRequestFilter(e.target.value as 'ALL' | 'TIER1_FOLLOWUP' | 'TIER2_REQUEST')}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm sm:text-base"
                >
                  <option value="ALL">All Requests</option>
                  <option value="TIER1_FOLLOWUP">Tier 1</option>
                  <option value="TIER2_REQUEST">Tier 2</option>
                </select>
              </div>
            )}
            
            <button
              onClick={currentView === 'companies' ? fetchCompanies : fetchCallRequests}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap text-sm sm:text-base"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {currentView === 'companies' ? 'Companies Management' : 'Call Requests'}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {currentView === 'companies' 
                ? 'Manage company settings and view associated users'
                : `View and manage call requests ${currentView === 'callRequests' ? `(${filteredCallRequests.length} total)` : ''}`
              }
            </p>
          </div>

          {loading ? (
            <div className="p-6 sm:p-8">
              <Loader text={`Loading ${currentView}...`} size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentView === 'companies' ? (
                // Companies View
                filteredCompanies.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <Building className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No companies found</p>
                  </div>
                ) : (
                  filteredCompanies.map((company) => {
                    const config = company.config ? JSON.parse(company.config) : {};
                    const hasTier2Access = config?.tier2AccessEnabled === true;
                    const isExpanded = expandedCompanies.has(company.id);
                    
                    return (
                      <div key={company.id} className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {company.name || 'Unnamed Company'}
                              </h3>
                              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 text-xs sm:text-sm text-gray-500">
                                <span className="truncate">{company.primaryDomain}</span>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>{company.users?.length || 0} users</span>
                                </div>
                                <span className="hidden sm:inline">Created {formatDate(company.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                            {/* Tier 2 Access Status */}
                            <div className="flex items-center justify-between sm:justify-start space-x-2">
                              <span className="text-sm font-medium text-gray-700">Tier 2:</span>
                              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                                hasTier2Access 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {hasTier2Access ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                    <span>Enabled</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3 flex-shrink-0" />
                                    <span>Disabled</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-3">
                              {/* Toggle Button */}
                              <LoadingButton
                                onClick={() => updateCompanyTier2Access(company.id, !hasTier2Access)}
                                loading={updatingCompany === company.id}
                                loadingText="..."
                                variant={hasTier2Access ? 'outline' : 'primary'}
                                size="sm"
                                className="text-xs sm:text-sm px-3 sm:px-4"
                              >
                                {hasTier2Access ? 'Disable' : 'Enable'}
                              </LoadingButton>

                              {/* Expand Button */}
                              <button
                                onClick={() => toggleCompanyExpansion(company.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded User Details */}
                        {isExpanded && company.users && company.users.length > 0 && (
                          <div className="mt-4 pl-0 sm:pl-16">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Users:</h4>
                            <div className="space-y-2">
                              {company.users.map((user: any) => (
                                <div key={user.id} className="flex items-start sm:items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                      <span className="font-medium text-gray-900 text-sm sm:text-base">{user.name || 'No name'}</span>
                                      <span className="text-xs sm:text-sm text-gray-500 break-all">{user.email}</span>
                                      {user.jobTitle && (
                                        <>
                                          <span className="text-gray-300 hidden sm:inline">•</span>
                                          <span className="text-xs sm:text-sm text-gray-500">{user.jobTitle}</span>
                                        </>
                                      )}
                                      {user.role && (
                                        <>
                                          <span className="text-gray-300 hidden sm:inline">•</span>
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
                paginatedCallRequests.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <Phone className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {filteredCallRequests.length === 0 ? 'No call requests found' : 'No requests on this page'}
                    </p>
                  </div>
                ) : (
                  paginatedCallRequests.map((request) => {
                    const metadata = request.metadata ? JSON.parse(request.metadata) : {};
                    const isExpanded = expandedCallRequests.has(request.id);
                    const hasAssessmentData = request.type === 'TIER1_FOLLOWUP' && request.assessmentInstanceId;
                    const assessmentInstance = request.assessmentInstanceId ? assessmentInstances[request.assessmentInstanceId] : null;
                    const isLoadingThisAssessment = loadingAssessment === request.assessmentInstanceId;
                    
                    return (
                      <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 mb-4">
                          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                  {metadata.userName || 'Unknown User'}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                                    {request.type === 'TIER1_FOLLOWUP' ? 'Tier 1' : 'Tier 2'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                    {request.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{metadata.userEmail || 'No email'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{metadata.companyName || 'No company'}</span>
                                  </div>
                                  {metadata.userJobTitle && (
                                    <div className="flex items-center space-x-2">
                                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                      <span className="truncate">{metadata.userJobTitle}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span>Preferred: {formatDate(request.preferredDate)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm">{formatTimes(request.preferredTimes)}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span>Requested: {formatDate(request.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              {request.remarks && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-xs sm:text-sm text-gray-700">
                                    <strong>Remarks:</strong> {request.remarks}
                                  </p>
                                </div>
                              )}

                              {metadata.assessmentScore && (
                                <div className="mt-3">
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    Assessment Score: 
                                    <span className="ml-1 font-semibold text-primary">
                                      {metadata.assessmentScore}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expand Button for Tier 1 Follow-up requests */}
                          {hasAssessmentData && (
                            <div className="flex justify-center sm:justify-start mt-4 sm:mt-0">
                              <button
                                onClick={() => handleViewAssessment(request.id, request.assessmentInstanceId!)}
                                disabled={isLoadingThisAssessment}
                                className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                              >
                                {isLoadingThisAssessment ? (
                                  <>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Loading...</span>
                                  </>
                                ) : (
                                  <>
                                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'View'} Assessment</span>
                                    <span className="sm:hidden">{isExpanded ? 'Hide' : 'View'}</span>
                                  </>
                                )}
                                {!isLoadingThisAssessment && (isExpanded ? (
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                ))}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Expanded Assessment View */}
                        {isExpanded && hasAssessmentData && assessmentInstance && (
                          <div className="mt-6 border-t pt-6">
                            <div className="mb-4">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                Tier 1 Assessment Results
                              </h4>
                              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Completed: {formatDate(assessmentInstance.createdAt)}</span>
                                </div>
                                {assessmentInstance.score && (
                                  <div className="flex items-center space-x-1">
                                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>
                                      Score: {JSON.parse(assessmentInstance.score).overallScore}/100
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Assessment Grid */}
                            {tier1Questions.length > 0 && assessmentInstance.responses && (
                              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr>
                                        <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 border-b bg-white text-xs sm:text-sm min-w-32 sm:min-w-48">
                                          Focus Areas
                                        </th>
                                        {getMaturityLabels().map((level: any) => (
                                          <th
                                            key={level}
                                            className="text-center p-2 sm:p-3 font-semibold text-gray-700 border-b min-w-24 sm:min-w-32 bg-white text-xs sm:text-sm"
                                          >
                                            {level}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tier1Questions.map((question) => {
                                        const responses = JSON.parse(assessmentInstance.responses);
                                        const selectedResponse = responses[question.id];
                                        
                                        return (
                                          <tr key={question.id} className="border-b border-gray-200">
                                            <td className="p-2 sm:p-3 font-medium text-gray-800 bg-white align-top text-xs sm:text-sm">
                                              {question.prompt}
                                            </td>
                                            {getSortedOptions(question).map((option: any) => {
                                              const isSelected = selectedResponse === option.value;
                                              return (
                                                <td
                                                  key={`${question.id}_${option.label}`}
                                                  className="p-1 sm:p-2 align-top"
                                                >
                                                  <div
                                                    className={`p-1 sm:p-2 rounded-lg text-xs leading-tight ${
                                                      isSelected
                                                        ? "text-white bg-blue-500"
                                                        : "text-gray-700 bg-white border border-gray-200"
                                                    }`}
                                                  >
                                                    {option.label}
                                                  </div>
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          )}
          
          {/* Pagination for Call Requests */}
          {currentView === 'callRequests' && filteredCallRequests.length > itemsPerPage && (
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCallRequests.length)} of {filteredCallRequests.length} requests
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}