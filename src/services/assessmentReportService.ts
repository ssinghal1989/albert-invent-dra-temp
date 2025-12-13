import { generateClient } from "aws-amplify/data";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export interface UploadReportParams {
  assessmentInstanceId: string;
  companyId: string;
  file: File;
  uploadedBy: string;
  notes?: string;
}

export interface AssessmentReportData {
  id: string;
  assessmentInstanceId: string;
  companyId: string;
  reportFileName: string;
  reportFileKey: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  fileSize?: number;
  mimeType?: string;
  notes?: string;
}

export const assessmentReportService = {
  async uploadReport(params: UploadReportParams): Promise<AssessmentReportData> {
    const { assessmentInstanceId, companyId, file, uploadedBy, notes } = params;

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `assessment-reports/${companyId}/${assessmentInstanceId}/${timestamp}-${sanitizedFileName}`;

    try {
      const uploadResult = await uploadData({
        path: fileKey,
        data: file,
        options: {
          contentType: file.type || "application/pdf",
        },
      }).result;

      const reportData = {
        assessmentInstanceId,
        companyId,
        reportFileKey: fileKey,
        reportFileName: file.name,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        status: "active" as const,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        notes: notes || "",
      };

      const { data, errors } = await client.models.AssessmentReport.create(reportData);

      if (errors || !data) {
        throw new Error(errors?.[0]?.message || "Failed to create report record");
      }

      return data as AssessmentReportData;
    } catch (error) {
      console.error("Error uploading report:", error);
      throw error;
    }
  },

  async getReportByAssessmentId(assessmentInstanceId: string): Promise<AssessmentReportData | null> {
    try {
      const { data, errors } = await client.models.AssessmentReport.list({
        filter: {
          assessmentInstanceId: { eq: assessmentInstanceId },
          status: { eq: "active" },
        },
      });

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to fetch report");
      }

      return data && data.length > 0 ? (data[0] as AssessmentReportData) : null;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  },

  async getReportsByCompanyId(companyId: string): Promise<AssessmentReportData[]> {
    try {
      const { data, errors } = await client.models.AssessmentReport.list({
        filter: {
          companyId: { eq: companyId },
          status: { eq: "active" },
        },
      });

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to fetch reports");
      }

      return (data || []) as AssessmentReportData[];
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  },

  async getAllReports(): Promise<AssessmentReportData[]> {
    try {
      const { data, errors } = await client.models.AssessmentReport.list({
        filter: {
          status: { eq: "active" },
        },
      });

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to fetch reports");
      }

      return (data || []) as AssessmentReportData[];
    } catch (error) {
      console.error("Error fetching all reports:", error);
      throw error;
    }
  },

  async getDownloadUrl(reportFileKey: string): Promise<string> {
    try {
      const result = await getUrl({
        path: reportFileKey,
        options: {
          expiresIn: 900,
        },
      });

      return result.url.toString();
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  },

  async deleteReport(reportId: string, reportFileKey: string): Promise<void> {
    try {
      await remove({ path: reportFileKey });

      const { errors } = await client.models.AssessmentReport.update({
        id: reportId,
        status: "deleted",
      });

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  async archiveReport(reportId: string): Promise<void> {
    try {
      const { errors } = await client.models.AssessmentReport.update({
        id: reportId,
        status: "archived",
      });

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to archive report");
      }
    } catch (error) {
      console.error("Error archiving report:", error);
      throw error;
    }
  },
};
