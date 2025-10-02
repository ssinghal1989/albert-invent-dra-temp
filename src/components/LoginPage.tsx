import React, { useEffect, useState } from "react";
import { User, Mail, Building, Briefcase, ArrowRight } from "lucide-react";
import {
  LOGIN_NEXT_STEP,
  useAppContext,
  UserData,
} from "../context/AppContext";
import { getCompanyNameFromDomain, getDomainFromEmail } from "../utils/common";
import { client } from "../amplifyClient";
import { useNavigate } from "react-router-dom";
import { useAuthFlow } from "../hooks/useAuthFlow";
import { ifDomainAlloeded } from "../utils/domain";
import { LoadingButton } from "./ui/LoadingButton";
import { useAssessment } from "../hooks/useAssesment";

interface LoginPageProps {
  onLogin: (userData: UserData) => void;
  onCancel: () => void;
  buttonText?: string;
  title?: string;
  subtitle?: string;
}

export function LoginPage({ 
  onLogin, 
  onCancel, 
  buttonText = "See Results",
  title = "Complete Your Information",
  subtitle = "Please provide your details to continue"
}: LoginPageProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = useState<UserData>({
    name: state.userData?.name || state.userFormData?.name || "",
    email: state.userData?.email || state.userFormData?.email || "",
    companyName:
      state.company?.name ||
      state.userFormData?.companyName ||
      getCompanyNameFromDomain(state.company?.primaryDomain!) ||
      "",
    jobTitle: state.userData?.jobTitle || state.userFormData?.jobTitle || "",
  });
  const isUserLoggedIn = !!state.loggedInUserDetails?.signInDetails?.loginId;
  const [loading, setLoading] = useState(false);
  const { submitTier1Assessment, fetchUserAssessments } = useAssessment();

  const [errors, setErrors] = useState<Partial<UserData>>({});

  const updateStateAndNavigateToOtp = (nextStep: LOGIN_NEXT_STEP) => {
    dispatch({ type: "LOGIN_NEXT_STEP", payload: nextStep });
    dispatch({ type: "SET_LOGIN_EMAIL", payload: formData.email });
    navigate("/otp-login");
  };

  const { handleAuth } = useAuthFlow(updateStateAndNavigateToOtp);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!ifDomainAlloeded(getDomainFromEmail(formData.email)!)) {
      newErrors.email = "Please use your work email address";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoggedInUser = async () => {
    // Check if company name available in database if not update it
    try {
      setLoading(true);
      if (state.company && !state.company?.name) {
        const { data: updatedCompany } = await client.models.Company.update({
          id: state.company?.id,
          name: formData.companyName,
        });
        dispatch({ type: "SET_COMPANY_DATA", payload: updatedCompany });
      }
      if (state?.userData) {
        const { data: updatedUser } = await client.models.User.update({
          id: state?.userData?.id,
          name: formData.name,
          jobTitle: formData.jobTitle,
        });
        dispatch({ type: "SET_USER_DATA", payload: updatedUser });
      }
      await submitTier1Assessment({});
      await fetchUserAssessments();
      navigate("/tier1-results");
    } catch (err) {
      setLoading(false);
      console.error("Error updating user/company data:", err);
      // Optionally, set an error state to inform the user
    }
  };

  const handleNewUser = async () => {
    try {
      dispatch({ type: "SET_USER_FORM_DATA", payload: formData });
      setLoading(true);
      await handleAuth(formData.email);
    } catch (err) {
      setLoading(false);
      console.error("Error during new user registration:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isUserLoggedIn) {
        handleLoggedInUser();
      } else {
        handleNewUser();
      }
    }
  };

  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                disabled={isUserLoggedIn}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Company Name Field */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                className={`block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.companyName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your company name"
              />
            </div>
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          {/* Job Title Field */}
          <div>
            <label
              htmlFor="jobTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Job Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 sm:py-4 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.jobTitle
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your job title"
              />
            </div>
            {errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
            )}
          </div>

          <LoadingButton
            disabled={!isFormValid}
            loadingText="Please wait ..."
            loading={loading}
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
              {buttonText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </LoadingButton>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 mt-3 text-sm sm:text-base"
          >
            Cancel
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your information is secure and will only be used for assessment
            purposes
          </p>
        </div>
      </div>
    </div>
  );
}
