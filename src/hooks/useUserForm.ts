import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_NEXT_STEP, useAppContext, UserData } from '../context/AppContext';
import { getCompanyNameFromDomain, getDomainFromEmail } from '../utils/common';
import { client } from '../amplifyClient';
import { useAuthFlow } from './useAuthFlow';
import { ifDomainAlloeded } from '../utils/domain';
import { useAssessment } from './useAssesment';

interface UseUserFormOptions {
  onSuccess?: () => void;
  redirectPath?: string;
  submitAssessment?: boolean;
}

export function useUserForm(options: UseUserFormOptions = {}) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { submitTier1Assessment, fetchUserAssessments } = useAssessment();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UserData>>({});

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
    try {
      setLoading(true);
      
      // Check if company name available in database if not update it
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
      
      if (options.submitAssessment) {
        await submitTier1Assessment({});
        await fetchUserAssessments();
      }
      
      if (options.redirectPath) {
        navigate(options.redirectPath);
      }
      
      if (options.onSuccess) {
        options.onSuccess();
      }
      
      setLoading(false);
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
        await handleLoggedInUser();
      } else {
        await handleNewUser();
      }
    }
  };

  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  return {
    formData,
    errors,
    loading,
    isFormValid,
    isUserLoggedIn,
    handleInputChange,
    handleSubmit,
    setFormData,
    setErrors,
    setLoading,
  };
}