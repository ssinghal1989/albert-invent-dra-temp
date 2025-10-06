import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
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
  BarChart3,
  Loader2
} from 'lucide-react';
import { client } from '../amplifyClient';
import { useAppContext } from '../context/AppContext';
import { LoadingButton } from './ui/LoadingButton';
import { Loader } from './ui/Loader';
import { UserManagement } from './admin/UserManagement';
import { CallRequestsManagement } from './admin/CallRequestsManagement';
import { CompaniesManagement } from './admin/CompaniesManagement';
import { QuestionManagement } from './admin/QuestionManagement';
import { AssessmentManagement } from './admin/AssessmentManagement';
import { SystemInfo } from './admin/SystemInfo';
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

interface User {
  id: string;
  email: string;
  name?: string;
  jobTitle?: string;
  role: 'user' | 'admin' | 'superAdmin';
  companyId?: string;
  company?: any;
  createdAt: string;
}

type AdminView = 'companies' | 'callRequests' | 'users';

export function AdminPanel() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<AdminView>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingCompany, setUpdatingCompany] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [updatingRoles, setUpdatingRoles] = useState<Record<string, boolean>>({});
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedCallRequests, setExpandedCallRequests] = useState<Set<string>>(new Set());
  const [tier1Questions, setTier1Questions] = useState<any[]>([]);
  const [assessmentInstances, setAssessmentInstances] = useState<Record<string, any>>({});
  const [loadingAssessment, setLoadingAssessment] = useState<string | null>(null);
  const [callRequestFilter, setCallRequestFilter] = useState<'ALL' | 'TIER1_FOLLOWUP' | 'TIER2_REQUEST'>('ALL');
  const [userFilter, setUserFilter] = useState<'ALL' | 'ALBERTINVENT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Check if current user is admin
  const isAdmin = state.userData?.role === 'admin' || state.userData?.role === 'superAdmin';
  const isSuperAdmin = state.userData?.role === 'superAdmin';

  useEffect(() => {
    if (isAdmin) {
      if (currentView === 'companies') {
        fetchCompanies();
      } else if (currentView === 'callRequests') {
        fetchCallRequests();
        loadTier1Questions();
      } else if (currentView === 'users') {
        fetchUsers();
      }
    }
  }, [currentView, isAdmin]);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.User.list();
      setUsers(data as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users'
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

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'superAdmin') => {
    try {
      setUpdatingUser(userId);
      
      const { data } = await client.models.User.update({
        id: userId,
        role: newRole
      });

      if (data) {
        // Update local state
        setUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, role: newRole }
              : u
          )
        );

        showToast({
          type: 'success',
          title: 'Role Updated',
          message: `User role updated to ${newRole}`
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user role'
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'superAdmin') => {
    try {
      setUpdatingRoles(prev => ({ ...prev, [userId]: true }));
      
      const { data } = await client.models.User.update({
        id: userId,
        role: newRole
      });

      if (data) {
        // Update local state
        setUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, role: newRole }
              : u
          )
        );

        showToast({
          type: 'success',
          title: 'Role Updated',
          message: `User role updated to ${newRole}`
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user role'
      });
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [userId]: false }));
    }
  };

  const openCompanyDomain = (domain: string) => {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    window.open(url, '_blank');
  };

  const getCompanyUrl = (domain: string) => {
    return domain.startsWith('http') ? domain : `https://${domain}`;
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

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <UserManagement />
          <CompaniesManagement />
        </div>
      </div>
    </main>
  );
}