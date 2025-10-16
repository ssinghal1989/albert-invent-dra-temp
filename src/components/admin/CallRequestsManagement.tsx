import React, { useState, useEffect } from 'react';
import { Phone, RefreshCw, Calendar, Clock, MessageSquare, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';

interface CallRequestStats {
  totalRequests: number;
  tier1Requests: number;
  tier2Requests: number;
  pendingRequests: number;
}

interface CallRequest {
  id: string;
  type: 'TIER1_FOLLOWUP' | 'TIER2_REQUEST';
  status: string;
  preferredDate: string;
  preferredTimes: string[];
  remarks?: string;
  createdAt: string;
  metadata?: string;
  assessmentInstanceId?: string;
}

export function CallRequestsManagement() {
  const [callRequestStats, setCallRequestStats] = useState<CallRequestStats>({
    totalRequests: 0,
    tier1Requests: 0,
    tier2Requests: 0,
    pendingRequests: 0
  });
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [showRequestsList, setShowRequestsList] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: requestsLoading, withLoading: withRequestsLoading } = useLoader();

  useEffect(() => {
    loadCallRequestStats();
  }, []);

  const loadCallRequestStats = async () => {
    await withStatsLoading(async () => {
      try {
        const requestsResult = await client.models.ScheduleRequest.list();
        const requests = requestsResult.data || [];

        const totalRequests = requests.length;
        const tier1Requests = requests.filter(r => r.type === 'TIER1_FOLLOWUP').length;
        const tier2Requests = requests.filter(r => r.type === 'TIER2_REQUEST').length;
        const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

        setCallRequestStats({
          totalRequests,
          tier1Requests,
          tier2Requests,
          pendingRequests
        });
      } catch (error) {
        console.error('Error loading call request stats:', error);
      }
    });
  };

  const loadCallRequestsList = async () => {
    await withRequestsLoading(async () => {
      try {
        const requestsResult = await client.models.ScheduleRequest.list({
          selectionSet: [
            'id',
            'type',
            'status',
            'preferredDate',
            'preferredTimes',
            'remarks',
            'createdAt',
            'metadata',
            'assessmentInstanceId'
          ]
        });
        
        const sortedRequests = (requestsResult.data || []).sort((a, b) => 
          new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()
        );
        
        setCallRequests(sortedRequests as CallRequest[]);
      } catch (error) {
        console.error('Error loading call requests list:', error);
      }
    });
  };

  const handleToggleRequestsList = async () => {
    if (!showRequestsList && callRequests.length === 0) {
      await loadCallRequestsList();
    }
    setShowRequestsList(!showRequestsList);
  };

  const toggleRequestExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getTierColor = (type: string) => {
    return type === 'TIER1_FOLLOWUP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Phone className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Call Requests Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <LoadingButton
            onClick={loadCallRequestStats}
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

      {/* Call Request Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : callRequestStats.totalRequests}
          </div>
          <div className="text-sm text-blue-800">Total Requests</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : callRequestStats.tier1Requests}
          </div>
          <div className="text-sm text-green-800">Tier 1 Follow-ups</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statsLoading ? '...' : callRequestStats.tier2Requests}
          </div>
          <div className="text-sm text-purple-800">Tier 2 Requests</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? '...' : callRequestStats.pendingRequests}
          </div>
          <div className="text-sm text-orange-800">Pending</div>
        </div>
      </div>

      {/* Toggle Call Requests List */}
      <div className="mb-4">
        <LoadingButton
          onClick={handleToggleRequestsList}
          loading={requestsLoading}
          loadingText="Loading Requests..."
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Phone className="w-4 h-4" />
          <span>{showRequestsList ? 'Hide Call Requests' : 'Show Call Requests'}</span>
        </LoadingButton>
      </div>

      {/* Call Requests List */}
      {showRequestsList && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Call Requests</h3>
          {callRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No call requests found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {callRequests.map((request) => {
                const isExpanded = expandedRequests.has(request.id);
                const metadata = request.metadata ? JSON.parse(request.metadata) : {};
                
                return (
                  <div key={request.id} className="bg-gray-50 rounded-lg border border-gray-200">
                    {/* Card Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {metadata.userName || 'Unknown User'}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${getTierColor(request.type)}`}>
                                {request.type === 'TIER1_FOLLOWUP' ? 'Tier 1' : 'Tier 2'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleRequestExpansion(request.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                          <span className="text-sm">Details</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Basic Info - Always Visible */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {formatDate(request.preferredDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {request.preferredTimes.map(formatTime).join(', ')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Requested: {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Contact Information */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500 w-16">Email:</span>
                                <span className="text-gray-700">{metadata.userEmail || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500 w-16">Company:</span>
                                <span className="text-gray-700">{metadata.companyName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500 w-16">Job Title:</span>
                                <span className="text-gray-700">{metadata.userJobTitle || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500 w-16">Domain:</span>
                                <span className="text-gray-700">{metadata.companyDomain || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Additional Details */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Additional Details</h5>
                            <div className="space-y-3">
                              {request.remarks && (
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Remarks</span>
                                  </div>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {request.remarks}
                                  </p>
                                </div>
                              )}
                              
                              {metadata.assessmentScore && (
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">Assessment Score</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-lg font-bold text-primary">
                                      {metadata.assessmentScore}
                                    </div>
                                    <span className="text-sm text-gray-500">/100</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}