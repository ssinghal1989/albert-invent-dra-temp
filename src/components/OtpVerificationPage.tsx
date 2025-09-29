import React, { useState, useEffect } from "react";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import {
  AuthUser,
  confirmSignIn,
  confirmSignUp,
  getCurrentUser,
  resendSignUpCode,
  signIn,
} from "aws-amplify/auth";
import { useSetUserData } from "../hooks/setUserData";
import { LoadingButton } from "./ui/LoadingButton";
import { LocalSchema } from "../amplifyClient";

interface OtpVerificationPageProps {
  userEmail: string;
  onCancel: () => void;
  onVerify: (data: {user: LocalSchema["User"]["type"]; company: LocalSchema["Company"]["type"]}) => void;
}

export function OtpVerificationPage({
  userEmail,
  onCancel,
  onVerify,
}: OtpVerificationPageProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { state, dispatch } = useAppContext();
  const otpLenght = state.loginNextStep === "CONFIRM_SIGNIN" ? 8 : 6;
  const { setUserData } = useSetUserData();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, otpLenght);
    setOtp(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length === otpLenght) {
      setVerifying(true);
      try {
        let currentUser: AuthUser | null = null;
        if (state.loginNextStep === "CONFIRM_SIGNUP") {
          await confirmSignUp({
            confirmationCode: otp,
            username: state.loginEmail,
          });
          await signIn({ username: state.loginEmail, password: "Temp@123" });
          currentUser = await getCurrentUser();
        } else {
          await confirmSignIn({ challengeResponse: otp });
          currentUser = await getCurrentUser();
        }
        const result = await setUserData({
          loggedInUserDetails: currentUser!,
          companyName: state.userFormData?.companyName || "",
          userJobTitle: state.userFormData?.jobTitle || "",
          userFullName: state.userFormData?.name || "",
        });
        dispatch({ type: "SET_LOGGED_IN_USER_DETAILS", payload: currentUser });
        setVerifying(false);
        onVerify({user: result.user as LocalSchema['User']['type'], company: result.company as LocalSchema['Company']['type']});
      } catch (err) {
        setVerifying(false);
        setError(
          (err as any)?.message || "Failed to verify code. Please try again."
        );
      }
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    // Simulate API call
    try {
      if (state.loginNextStep === "CONFIRM_SIGNIN") {
        await signIn({
          username: state.loginEmail,
          options: {
            authFlowType: "USER_AUTH",
            preferredChallenge: "EMAIL_OTP",
          },
        });
      } else {
        await resendSignUpCode({ username: state.loginEmail });
      }
      setIsResending(false);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
    }
    setOtp("");
  };

  const isOtpValid = otp.length === otpLenght;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a {otpLenght}-digit verification code to
          </p>
          <p className="text-gray-900 font-medium mt-1">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              className="block w-full px-4 py-4 text-center text-2xl font-mono border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 tracking-widest"
              placeholder={otpLenght === 6 ? "000000" : "00000000"}
              maxLength={otpLenght}
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Enter the {otpLenght}-digit code sent to your email
            </p>

            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Verify Button */}

          <LoadingButton
            disabled={!isOtpValid}
            loadingText="Verifying Otp ..."
            loading={verifying}
            style={{ width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
              }}
            >
              {state.loginFlow === "VIA_ASSESSMENT"
                ? "Verify & See Results"
                : "Verify"}
              <ArrowRight className="w-5 h-5" />
            </div>
          </LoadingButton>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
          >
            Back
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or try resending
          </p>
        </div>
      </div>
    </div>
  );
}
