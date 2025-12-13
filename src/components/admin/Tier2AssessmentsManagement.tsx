import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Building, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';
import { useAssessmentReport } from '../../hooks/useAssessmentReport';
import { ReportUploadModal } from './ReportUploadModal';

interface AssessmentStats {
  totalTier2: number;
  withReports: number;
  withoutReports: number;
}

interface Tier2Assessment {
  id: string;
  companyId?: string;
  initiatorUserId?: string;
  submittedAt?: string;
  scoredAt?: string;
  company?: {
    name?: string;
    primaryDomain: string;
  };
  initiator?: {
    name?: string;
    email: string;
  };
  hasReport: boolean;
  reportFileName?: string;
}

export function Tier2AssessmentsManagement() {
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats>({
    totalTier2: 0,
    withReports: 0,
    withoutReports: 0
  });
  const [assessments, setAssessments] = useState<Tier2Assessment[]>([]);
  const [showAssessmentsList, setShowAssessmentsList] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Tier2Assessment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: assessmentsLoading, withLoading: withAssessmentsLoading } = useLoader();
  const { downloadReport, getAllReports } = useAssessmentReport();

  useEffect(() => {
    loadAssessmentStats();
  }, []);

  const loadAssessmentStats = async () => {
    await withStatsLoading(async () => {
      try {
        const tier2Result = await client.models.AssessmentInstance.list({
          filter: {
            assessmentType: { eq: "TIER2" }
          }
        });

        const reports = await getAllReports();
        const reportsMap = new Map(
          reports.map(r => [r.assessmentInstanceId, r])
        );

        const totalTier2 = tier2Result.data?.length || 0;
        const withReports = tier2Result.data?.filter(a =>
          reportsMap.has(a.id)
        ).length || 0;

        setAssessmentStats({
          totalTier2,
          withReports,
          withoutReports: totalTier2 - withReports
        });
      } catch (error) {
        console.error('Error loading assessment stats:', error);
      }
    });
  };

  const loadAssessmentsList = async () => {
    await withAssessmentsLoading(async () => {
      try {
        const tier2Result = await client.models.AssessmentInstance.list({
          filter: {
            assessmentType: { eq: "TIER2" }
          },
          selectionSet: [
            'id',
            'companyId',
            'initiatorUserId',
            'submittedAt',
            'scoredAt',
            'company.name',
            'company.primaryDomain',
            'initiator.name',
            'initiator.email'
          ]
        });

        const reports = await getAllReports();
        const reportsMap = new Map(
          reports.map(r => [r.assessmentInstanceId, r])
        );

        const assessmentsWithReports = tier2Result.data?.map(assessment => {
          const report = reportsMap.get(assessment.id);
          return {
            id: assessment.id,
            companyId: assessment.companyId,
            initiatorUserId: assessment.initiatorUserId,
            submittedAt: assessment.submittedAt,
            scoredAt: assessment.scoredAt,
            company: assessment.company,
            initiator: assessment.initiator,
            hasReport: !!report,
            reportFileName: report?.reportFileName
          };
        }) || [];

        setAssessments(assessmentsWithReports);
        setShowAssessmentsList(true);
      } catch (error) {
        console.error('Error loading assessments list:', error);
      }
    });
  };

  const handleUploadClick = (assessment: Tier2Assessment) => {
    setSelectedAssessment(assessment);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setSelectedAssessment(null);
    loadAssessmentStats();
    if (showAssessmentsList) {
      loadAssessmentsList();
    }
  };

  const handleDownloadClick = async (assessment: Tier2Assessment) => {
    if (assessment.hasReport && assessment.reportFileName) {
      try {
        const reports = await getAllReports();
        const report = reports.find(r => r.assessmentInstanceId === assessment.id);
        if (report) {
          await downloadReport(report.reportFileKey, report.reportFileName);
        }
      } catch (error) {
        console.error('Error downloading report:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tier 2 Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessmentStats.totalTier2}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Reports</p>
              <p className="text-2xl font-bold text-green-600">{assessmentStats.withReports}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Without Reports</p>
              <p className="text-2xl font-bold text-amber-600">{assessmentStats.withoutReports}</p>
            </div>
            <XCircle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Manage Reports</h3>
        <LoadingButton
          onClick={loadAssessmentsList}
          isLoading={assessmentsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FileText className="w-4 h-4" />
          View All Assessments
        </LoadingButton>
      </div>

      {showAssessmentsList && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assessment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Initiator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Report Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {assessment.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {assessment.company?.name || 'N/A'}
                          </div>
                          <div className="text-gray-500">{assessment.company?.primaryDomain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {assessment.initiator?.name || 'N/A'}
                        </div>
                        <div className="text-gray-500">{assessment.initiator?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {assessment.submittedAt
                            ? new Date(assessment.submittedAt).toLocaleDateString()
                            : 'Not submitted'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assessment.hasReport ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">
                            {assessment.reportFileName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-600 font-medium">No report</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {assessment.hasReport ? (
                          <button
                            onClick={() => handleDownloadClick(assessment)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUploadClick(assessment)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUploadModal && selectedAssessment && (
        <ReportUploadModal
          assessment={selectedAssessment}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedAssessment(null);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
