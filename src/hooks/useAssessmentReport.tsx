import { useState, useCallback } from "react";
import {
  assessmentReportService,
  type UploadReportParams,
  type AssessmentReportData,
} from "../services/assessmentReportService";

export const useAssessmentReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadReport = useCallback(async (params: UploadReportParams) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await assessmentReportService.uploadReport(params);
      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload report";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReportByAssessmentId = useCallback(
    async (assessmentInstanceId: string): Promise<AssessmentReportData | null> => {
      setLoading(true);
      setError(null);

      try {
        const report = await assessmentReportService.getReportByAssessmentId(assessmentInstanceId);
        return report;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch report";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getReportsByCompanyId = useCallback(async (companyId: string): Promise<AssessmentReportData[]> => {
    setLoading(true);
    setError(null);

    try {
      const reports = await assessmentReportService.getReportsByCompanyId(companyId);
      return reports;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch reports";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllReports = useCallback(async (): Promise<AssessmentReportData[]> => {
    setLoading(true);
    setError(null);

    try {
      const reports = await assessmentReportService.getAllReports();
      return reports;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch all reports";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (reportFileKey: string, fileName: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = await assessmentReportService.getDownloadUrl(reportFileKey);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download report";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string, reportFileKey: string) => {
    setLoading(true);
    setError(null);

    try {
      await assessmentReportService.deleteReport(reportId, reportFileKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete report";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);

    try {
      await assessmentReportService.archiveReport(reportId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to archive report";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadProgress,
    uploadReport,
    getReportByAssessmentId,
    getReportsByCompanyId,
    getAllReports,
    downloadReport,
    deleteReport,
    archiveReport,
  };
};
