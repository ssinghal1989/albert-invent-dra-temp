import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Building, 
  Calendar, 
  Clock, 
  Briefcase,
  User,
  Filter,
  Loader2,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { client, LocalSchema } from '../amplifyClient';
import { useCallRequest } from '../hooks/useCallRequest';
import { LoadingButton } from './ui/LoadingButton';
import { useToast } from '../context/ToastContext';

type UserRole = 'user' | 'admin' | 'superAdmin';

interface UserWithCompany extends LocalSchema['User']['type'] {
  company?: LocalSchema['Company']['type'] | null;
}

interface CallRequestWithMetadata extends LocalSchema['ScheduleRequest']['type'] {
  metadata?: string;
  parsedMetadata?: {
    userEmail?: string;
    userName?: string;
    companyName?: string;
    userJobTitle?: string;
    assessmentScore?: string;
  };
}

export function AdminPanel() {
  const { state } = useAppContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'call-requests' | 'users'>('call-requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlbertInventOnly, setShowAlbertInventOnly] = useState(false);
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());
  
  const { userScheduledCalls, fetchUserCallRequests } = useCallRequest();
  const itemsPerPage = 10;
  const isSuperAdmin = state.userData?.role === 'superAdmin';

  // Fetch users for super admin
  useEffect(() => {
    if (isSuperAdmin && activeTab === 'users') {
      fetchUsers();
    }
  }, [isSuperAdmin, activeTab]);

  // Fetch call requests
  useEffect(() => {
    if (activeTab === 'call-requests') {
      fetchUserCallRequests();
    }
  }, [activeTab, fetchUserCallRequests]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await client.models.User.list();
      if (data) {
        // Fetch company data for each user
        const usersWithCompany = await Promise.all(
          data.map(async (user) => {
            if (user.companyId) {
              try {
                const companyResult = await user.company();
                return {
                  ...user,
                  company: companyResult?.data || null
                };
              } catch (error) {
                console.error(`Error fetching company for user ${user.id}:`, error);
                return { ...user, company: null };
              }
            }
            return { ...user, company: null };
          })
        );
        setUsers(usersWithCompany);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users',
        duration: 5000,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (userId === state.userData?.id) {
      showToast({
        type: 'warning',
        title: 'Cannot Change Own Role',
        message: 'You cannot change your own role',
        duration: 3000,
      });
      return;
    }

    setUpdatingRoles(prev => new Set(prev).add(userId));
    
    try {
      await client.models.User.update({
        id: userId,
        role: newRole,
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      showToast({
        type: 'success',
        title: 'Role Updated',
        message: 'User role has been updated successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user role',
        duration: 5000,
      });
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getCompanyUrl = (domain: string): string => {
    if (!domain) return '#';
    return domain.startsWith('http') ? domain : `https://${domain}`;
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case 'superAdmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isAlbertInventUser = (email: string): boolean => {
    return email?.toLowerCase().includes('@albertinvent.com') || false;
  };

  // Process call requests with metadata
  const processedCallRequests: CallRequestWithMetadata[] = userScheduledCalls.map(request => {
    let parsedMetadata;
    try {
      parsedMetadata = request.metadata ? JSON.parse(request.metadata as string) : {};
    } catch (error) {
      console.error('Error parsing metadata:', error);
      parsedMetadata = {};
    }
    
    return {
      ...request,
      parsedMetadata
    };
  });

  // Filter and search logic
  const getFilteredData = () => {
    if (activeTab === 'call-requests') {
      return processedCallRequests.filter(request => {
        const searchFields = [
          request.parsedMetadata?.userName || '',
          request.parsedMetadata?.userEmail || '',
          request.parsedMetadata?.companyName || ''
        ].join(' ').toLowerCase();
        
        return searchFields.includes(searchTerm.toLowerCase());
      });
    } else {
      let filteredUsers = users.filter(user => {
        const searchFields = [
          user.name || '',
          user.email || '',
          user.company?.name || ''
        ].join(' ').toLowerCase();
        
        const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
        const matchesFilter = !showAlbertInventOnly || isAlbertInventUser(user.email || '');
        
        return matchesSearch && matchesFilter;
      });
      
      return filteredUsers;
    }
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination when switching tabs or changing search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, showAlbertInventOnly]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimes = (times: string[]): string => {
    return times.map(time => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }).join(', ');
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage call requests and user permissions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`grid ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-2 bg-gray-100 p-1 rounded-lg max-w-md`}>
            <button
              onClick={() => setActiveTab('call-requests')}
              className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'call-requests'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Requests</span>
            </button>
            
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'call-requests' ? 'call requests' : 'users'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {activeTab === 'users' && (
            <button
              onClick={() => setShowAlbertInventOnly(!showAlbertInventOnly)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                showAlbertInventOnly
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Albert Invent Only</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Content Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'call-requests' ? 'Call Requests' : 'User Management'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'call-requests' 
                    ? `Manage scheduled calls and assessments (${filteredData.length} total)`
                    : `Manage user roles and permissions (${filteredData.length} total)`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'call-requests' ? (
              // Call Requests Content
              <div className="space-y-4">
                {paginatedData.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No call requests found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms.' : 'Call requests will appear here when users schedule them.'}
                    </p>
                  </div>
                ) : (
                  (paginatedData as CallRequestWithMetadata[]).map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="grid grid-cols-12 gap-4">
                        {/* Left Section - User Info (8 columns) */}
                        <div className="col-span-12 lg:col-span-8">
                          {/* Name and Badges */}
                          <div className="flex items-center space-x-3 mb-3">
                            <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <h3 className="font-semibold text-gray-900 truncate">
                              {request.parsedMetadata?.userName || 'Unknown User'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.type === 'TIER1_FOLLOWUP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {request.type === 'TIER1_FOLLOWUP' ? 'Tier 1' : 'Tier 2'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                              request.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>

                          {/* User Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{request.parsedMetadata?.userEmail || 'No email'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{request.parsedMetadata?.userJobTitle || 'No job title'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 flex-shrink-0" />
                              {request.parsedMetadata?.companyName ? (
                                <a
                                  href={getCompanyUrl(request.parsedMetadata.companyName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-700 hover:underline truncate"
                                >
                                  {request.parsedMetadata.companyName}
                                </a>
                              ) : (
                                <span className="truncate">No company</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Requested: {formatDate(request.createdAt || '')}</span>
                            </div>
                          </div>

                          {/* Assessment Score for Tier 1 */}
                          {request.type === 'TIER1_FOLLOWUP' && request.parsedMetadata?.assessmentScore && (
                            <div className="text-sm">
                              <span className="text-gray-600">Assessment Score: </span>
                              <span className="font-semibold text-primary">
                                {request.parsedMetadata.assessmentScore}
                              </span>
                            </div>
                          )}

                          {/* Remarks */}
                          {request.remarks && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-start space-x-2">
                                <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0 mt-0.5"></div>
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</span>
                                  <p className="text-sm text-gray-700 mt-1">{request.remarks}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Schedule Info (4 columns) */}
                        <div className="col-span-12 lg:col-span-4 lg:text-right">
                          <div className="space-y-2 text-sm">
                            <div className="flex lg:justify-end items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Preferred: {formatDate(request.preferredDate)}</span>
                            </div>
                            <div className="flex lg:justify-end items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatTimes(request.preferredTimes as string[] || [])}</span>
                            </div>
                          </div>

                          {/* View Assessment Button for Tier 1 */}
                          {request.type === 'TIER1_FOLLOWUP' && (
                            <div className="mt-4 lg:flex lg:justify-end">
                              <div className="relative">
                                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>View Assessment</span>
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Users Content
              <div className="space-y-4">
                {loadingUsers ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : paginatedData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">
                      {searchTerm || showAlbertInventOnly ? 'Try adjusting your search or filters.' : 'Users will appear here when they sign up.'}
                    </p>
                  </div>
                ) : (
                  (paginatedData as UserWithCompany[]).map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="grid grid-cols-12 gap-4">
                        {/* Left Section - User Info (8 columns) */}
                        <div className="col-span-12 lg:col-span-8">
                          {/* Name and Badges */}
                          <div className="flex items-center space-x-3 mb-3">
                            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <h3 className="font-semibold text-gray-900 truncate">
                              {user.name || 'No Name'}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role as UserRole)}`}>
                              {user.role === 'superAdmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                            {user.id === state.userData?.id && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                You
                              </span>
                            )}
                            {isAlbertInventUser(user.email || '') && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-white">
                                Albert Invent
                              </span>
                            )}
                          </div>

                          {/* User Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{user.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{user.jobTitle || 'No job title'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 flex-shrink-0" />
                              {user.company?.name ? (
                                <a
                                  href={getCompanyUrl(user.company.primaryDomain || '')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-700 hover:underline truncate"
                                >
                                  {user.company.name}
                                </a>
                              ) : (
                                <span className="truncate">No company</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">Joined {formatDate(user.createdAt || '')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Role Management (4 columns) */}
                        <div className="col-span-12 lg:col-span-4 lg:text-right">
                          <div className="flex flex-col lg:items-end space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Current Role:</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role as UserRole)}`}>
                                {user.role === 'superAdmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Change to:</span>
                              <div className="relative">
                                {updatingRoles.has(user.id) ? (
                                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-gray-600">Updating...</span>
                                  </div>
                                ) : (
                                  <select
                                    value={user.role || 'user'}
                                    onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                                    disabled={user.id === state.userData?.id}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superAdmin">Super Admin</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}