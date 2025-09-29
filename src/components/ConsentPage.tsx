import React, { useState } from 'react';
import { Shield, CheckCircle, ArrowRight } from 'lucide-react';

interface ConsentPageProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentPage({ onAccept, onDecline }: ConsentPageProps) {
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms & Privacy Notice</h1>
          <p className="text-gray-600">Please review and accept our terms to continue</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Albert Digital Readiness Assessment Terms</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              By participating in this assessment, you agree to provide accurate information about your 
              organization's digital maturity and capabilities.
            </p>
            <p>
              <strong>Data Collection:</strong> We collect information about your organization's digital 
              practices, technology usage, and maturity levels to provide personalized recommendations.
            </p>
            <p>
              <strong>Data Usage:</strong> Your responses will be used to generate your assessment report 
              and may be aggregated (anonymously) for industry benchmarking purposes.
            </p>
            <p>
              <strong>Privacy:</strong> We protect your personal and organizational data in accordance with 
              our Privacy Policy. Your individual responses will not be shared with third parties without 
              your explicit consent.
            </p>
            <p>
              <strong>Results:</strong> Assessment results will be provided to you via email and through 
              your secure portal account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
              I have read and agree to the Albert Digital Readiness Assessment Terms and Privacy Policy. 
              I consent to the collection and use of my data as described above.
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 border border-gray-300"
            >
              Decline
            </button>
            <button
              type="submit"
              disabled={!accepted}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                accepted
                  ? 'bg-primary text-white hover:opacity-90 hover:shadow-lg'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <span>Accept & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you acknowledge that you have read our{' '}
            <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}