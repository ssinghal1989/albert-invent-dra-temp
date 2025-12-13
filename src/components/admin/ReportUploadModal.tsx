import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAssessmentReport } from '../../hooks/useAssessmentReport';
import { LoadingButton } from '../ui/LoadingButton';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface ReportUploadModalProps {
  company: {
    id: string;
    name?: string;
    primaryDomain: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportUploadModal({ company, onClose, onSuccess }: ReportUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadReport, uploadProgress } = useAssessmentReport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a PDF file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !company.id) {
      setErrorMessage('Missing required information');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const userAttributes = await fetchUserAttributes();
      const uploadedBy = userAttributes.sub || 'admin';

      await uploadReport({
        assessmentInstanceId: company.id,
        companyId: company.id,
        file: selectedFile,
        uploadedBy,
        notes
      });

      setUploadStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload report');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Assessment Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploadStatus === 'uploading'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Company Details</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Company:</span> {company.name || 'N/A'}</p>
              <p><span className="font-medium">Domain:</span> {company.primaryDomain}</p>
              <p className="text-xs text-blue-600 mt-2">This report will be linked to the entire company</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF Report
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadStatus === 'uploading'}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-green-600 mb-3" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    disabled={uploadStatus === 'uploading'}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Click to upload PDF</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this report..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploadStatus === 'uploading'}
            />
          </div>

          {uploadStatus === 'uploading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Uploading report...</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-900">
                Report uploaded successfully!
              </p>
            </div>
          )}

          {(uploadStatus === 'error' || errorMessage) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-900">{errorMessage || 'An error occurred'}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={uploadStatus === 'uploading'}
          >
            Cancel
          </button>
          <LoadingButton
            onClick={handleUpload}
            isLoading={uploadStatus === 'uploading'}
            disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Report
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
