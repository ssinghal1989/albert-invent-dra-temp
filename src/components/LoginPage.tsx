import React, { useState } from 'react';
import { User, Mail, Building, Briefcase, ArrowRight } from 'lucide-react';
import { UserData } from '../context/AppContext';
import { domainBlockingService } from '../services/domainBlockingService';
import { LoadingButton } from './ui/LoadingButton';
import { useLoader } from '../hooks/useLoader';

interface LoginPageProps {
  onLogin: (userData: UserData) => void;
  onCancel: () => void;
}

export function LoginPage({ onLogin, onCancel }: LoginPageProps) {
  const { isLoading, withLoading } = useLoader();
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    companyName: '',
    jobTitle: ''
  });

  const [errors, setErrors] = useState<Partial<UserData>>({});

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else {
      const domainCheck = domainBlockingService.isEmailAllowed(formData.email);
      if (!domainCheck.allowed) {
        newErrors.email = domainCheck.reason || 'Email domain not allowed';
      }
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      withLoading(async () => {
        // Simulate form processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
        onLogin(formData);
      });
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
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

      </div>
    </div>
  );
}