import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Building, Calendar, CheckCircle, XCircle, ChevronDown, User } from 'lucide-react';
import { client } from '../../amplifyClient';
import { LoadingButton } from '../ui/LoadingButton';
import { useLoader } from '../../hooks/useLoader';
import { useAssessmentReport } from '../../hooks/useAssessmentReport';
import { ReportUploadModal } from './ReportUploadModal';
import { CompanyScoreChart } from '../charts/CompanyScoreChart';

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

interface DimensionScore {
  dimensionName: string;
  score: number;
  maxScore: number;
}

interface CompanyReport {
  id: string;
  reportFileName: string;
  reportFileKey: string;
  uploadedAt: string;
  uploadedBy: string;
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
  const [dimensionScores, setDimensionScores] = useState<DimensionScore[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [companyReport, setCompanyReport] = useState<CompanyReport | null>(null);
  const [showAssessmentsList, setShowAssessmentsList] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { isLoading: companiesLoading, withLoading: withCompaniesLoading } = useLoader();
  const { isLoading: statsLoading, withLoading: withStatsLoading } = useLoader();
  const { isLoading: assessmentsLoading, withLoading: withAssessmentsLoading } = useLoader();
  const { downloadReport, getAllReports, getReportsByCompanyId } = useAssessmentReport();

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

        const companyReports = await getReportsByCompanyId(companyId);
        const hasReport = companyReports.length > 0;

        if (hasReport && companyReports[0]) {
          setCompanyReport({
            id: companyReports[0].id,
            reportFileName: companyReports[0].reportFileName,
            reportFileKey: companyReports[0].reportFileKey,
            uploadedAt: companyReports[0].uploadedAt,
            uploadedBy: companyReports[0].uploadedBy
          });
        } else {
          setCompanyReport(null);
        }

        const totalTier2 = tier2Result.data?.length || 0;

        setAssessmentStats({
          totalTier2,
          withReports: hasReport ? 1 : 0,
          withoutReports: hasReport ? 0 : 1
        });

        await calculateCompanyScores(companyId);
      } catch (error) {
        console.error('Error loading assessment stats:', error);
      }
    });
  };

  const calculateCompanyScores = async (companyId: string) => {
    try {
      const assessmentsResult = await client.models.AssessmentInstance.list({
        filter: {
          assessmentType: { eq: "TIER2" },
          companyId: { eq: companyId }
        }
      });

      if (!assessmentsResult.data || assessmentsResult.data.length === 0) {
        setDimensionScores([]);
        setOverallScore(0);
        return;
      }

      const dimensionAggregates = new Map<string, { totalScore: number; count: number; maxScore: number }>();

      for (const assessment of assessmentsResult.data) {
        const responsesResult = await client.models.AssessmentResponse.list({
          filter: {
            assessmentInstanceId: { eq: assessment.id }
          },
          selectionSet: ['id', 'questionId', 'selectedOptionId', 'question.dimensionId', 'selectedOption.points', 'question.dimension.name']
        });

        if (responsesResult.data) {
          for (const response of responsesResult.data) {
            const dimensionName = response.question?.dimension?.name || 'Unknown';
            const points = response.selectedOption?.points || 0;

            if (!dimensionAggregates.has(dimensionName)) {
              dimensionAggregates.set(dimensionName, { totalScore: 0, count: 0, maxScore: 5 });
            }

            const aggregate = dimensionAggregates.get(dimensionName)!;
            aggregate.totalScore += points;
            aggregate.count += 1;
          }
        }
      }

      const scores: DimensionScore[] = Array.from(dimensionAggregates.entries()).map(([name, data]) => ({
        dimensionName: name,
        score: data.count > 0 ? data.totalScore / assessmentsResult.data.length : 0,
        maxScore: data.maxScore
      }));

      const total = scores.reduce((sum, d) => sum + d.score, 0);

      setDimensionScores(scores);
      setOverallScore(total);
    } catch (error) {
      console.error('Error calculating company scores:', error);
      setDimensionScores([]);
      setOverallScore(0);
    }
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

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    if (selectedCompany) {
      loadAssessmentStats(selectedCompany.id);
      if (showAssessmentsList) {
        loadAssessmentsList(selectedCompany.id);
      }
    }
  };

  const handleDownloadCompanyReport = async () => {
    if (companyReport) {
      try {
        await downloadReport(companyReport.reportFileKey, companyReport.reportFileName);
      } catch (error) {
        console.error('Error downloading report:', error);
      }
    }
  };

  const handleViewAllAssessments = () => {
    if (selectedCompany) {
      loadAssessmentsList(selectedCompany.id);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3">
                {companyReport ? (
                  <button
                    onClick={handleDownloadCompanyReport}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                ) : (
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Report
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tier 2 Assessments</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{assessmentStats.totalTier2}</p>
                  </div>
                  <User className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Company Report Status</p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      {companyReport ? 'Report Available' : 'No Report'}
                    </p>
                  </div>
                  {companyReport ? (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  ) : (
                    <XCircle className="w-10 h-10 text-amber-500" />
                  )}
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assessments Completed</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {assessmentStats.totalTier2}
                    </p>
                  </div>
                  <FileText className="w-10 h-10 text-purple-500" />
                </div>
              </div>
            </div>

            {companyReport && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{companyReport.reportFileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded on {new Date(companyReport.uploadedAt).toLocaleDateString()} at{' '}
                      {new Date(companyReport.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyScoreChart
              overallScore={overallScore}
              dimensionScores={dimensionScores}
            />

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.totalTier2}</p>
                  </div>
                  <User className="w-8 h-8 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Dimensions Evaluated</p>
                    <p className="text-2xl font-bold text-gray-900">{dimensionScores.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>

                <div className="mt-6">
                  <LoadingButton
                    onClick={handleViewAllAssessments}
                    isLoading={assessmentsLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    View Individual Assessments
                  </LoadingButton>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedCompany && showAssessmentsList && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Individual Assessments</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing all Tier 2 assessments completed by employees from this company
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assessment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
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
                          {assessment.id.slice(0, 12)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {assessment.initiator?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{assessment.initiator?.email || 'N/A'}</span>
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
                        {assessment.scoredAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : assessment.submittedAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            In Progress
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUploadModal && selectedCompany && (
        <ReportUploadModal
          company={selectedCompany}
          onClose={() => {
            setShowUploadModal(false);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
