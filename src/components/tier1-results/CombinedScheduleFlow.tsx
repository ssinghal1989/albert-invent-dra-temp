import React from 'react';
import { CombinedScheduleForm, CombinedScheduleData } from '../ui/CombinedScheduleForm';
import { OtpVerificationPage } from '../OtpVerificationPage';
import { LocalSchema } from '../../amplifyClient';

interface CombinedScheduleFlowProps {
  showCombinedForm: boolean;
  showCombinedOtp: boolean;
  combinedFormData: CombinedScheduleData | null;
  onCombinedFormSubmit: (data: CombinedScheduleData) => Promise<void>;
  onCombinedOtpVerification: (data: { user?: LocalSchema["User"]["type"]; company?: LocalSchema["Company"]["type"] }) => void;
  onCancelCombinedForm: () => void;
  onCancelCombinedOtp: () => void;
}

export function CombinedScheduleFlow({
  showCombinedForm,
  showCombinedOtp,
  combinedFormData,
  onCombinedFormSubmit,
  onCombinedOtpVerification,
  onCancelCombinedForm,
  onCancelCombinedOtp
}: CombinedScheduleFlowProps) {
  return (
    <>
      {/* Combined Schedule Form */}
      <CombinedScheduleForm
        isOpen={showCombinedForm}
        onClose={onCancelCombinedForm}
        onSubmit={onCombinedFormSubmit}
        title="Schedule a Follow-up Call"
      />

      {/* Combined OTP Verification Modal */}
      {showCombinedOtp && combinedFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <OtpVerificationPage
              userEmail={combinedFormData.email}
              onVerify={onCombinedOtpVerification}
              onCancel={onCancelCombinedOtp}
            />
          </div>
        </div>
      )}
    </>
  );
}