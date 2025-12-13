import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Building, Calendar, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';
import { useAssessmentReport } from '../../hooks/useAssessmentReport';
import { ReportUploadModal } from './ReportUploadModal';

interface Company {
  id: string;
  name?: string;
  primaryDomain: string;
}

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats>({
    totalTier2: 0,
    withReports: 0,
    withoutReports: 0
  });
  const [assessments, setAssessments] = useState<Tier2Assessment[]>([]);
  const [showAssessmentsList, setShowAssessmentsList] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Tier2Assessment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { isLoading: companiesLoading, withLoading: withCompaniesLoading } = useLoader();
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: assessmentsLoading, withLoading: withAssessmentsLoading } = useLoader();
  const { downloadReport, getAllReports } = useAssessmentReport();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    await withCompaniesLoading(async () => {
      try {
        const { data } = await client.models.Company.list();
        const companiesList = (data || []).map(c => ({
          id: c.id,
          name: c.name,
          primaryDomain: c.primaryDomain
        }));
        setCompanies(companiesList);
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    });
  };

  const loadAssessmentStats = async (companyId: string) => {
    await withStatsLoading(async () => {
      try {
        const tier2Result = await client.models.AssessmentInstance.list({
          filter: {
            assessmentType: { eq: "TIER2" },
            companyId: { eq: companyId }
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

  const loadAssessmentsList = async (companyId: string) => {
    await withAssessmentsLoading(async () => {
      try {
        const tier2Result = await client.models.AssessmentInstance.list({
          filter: {
            assessmentType: { eq: "TIER2" },
            companyId: { eq: companyId }
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

  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    setShowAssessmentsList(false);
    await loadAssessmentStats(company.id);
  };

  const handleUploadClick = (assessment: Tier2Assessment) => {
    setSelectedAssessment(assessment);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setSelectedAssessment(null);
    if (selectedCompany) {
      loadAssessmentStats(selectedCompany.id);
      if (showAssessmentsList) {
        loadAssessmentsList(selectedCompany.id);
      }
    }
  };

  const handleViewAllAssessments = () => {
    if (selectedCompany) {
      loadAssessmentsList(selectedCompany.id);
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600" />
          Select Company
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose a company to view their Tier 2 assessment reports and upload detailed reports.
        </p>

        {companiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedCompany?.id || ''}
              onChange={(e) => {
                const company = companies.find(c => c.id === e.target.value);
                if (company) handleCompanySelect(company);
              }}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 appearance-none cursor-pointer"
            >
              <option value="">Select a company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name || company.primaryDomain} ({company.primaryDomain})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {selectedCompany && (
        <>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCompany.name || selectedCompany.primaryDomain}
                </h3>
                <p className="text-sm text-gray-500">{selectedCompany.primaryDomain}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tier 2 Assessments</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{assessmentStats.totalTier2}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">With Reports</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{assessmentStats.withReports}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Without Reports</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{assessmentStats.withoutReports}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Manage Reports</h3>
            <LoadingButton
              onClick={handleViewAllAssessments}
              isLoading={assessmentsLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <FileText className="w-4 h-4" />
              View All Assessments
            </LoadingButton>
          </div>
        </>
      )}

      {selectedCompany && showAssessmentsList && (
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
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No assessments found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        This company has not completed any Tier 2 assessments yet.
                      </p>
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
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
                  ))
                )}
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
