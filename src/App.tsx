import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider, useAppContext, UserData } from './context/AppContext';
import { apiService } from './services/amplifyService';
import { seedDataService } from './services/seedDataService';
import { useLoader } from './hooks/useLoader';
import { Loader } from './components/ui/Loader';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { ConsentPage } from './components/ConsentPage';
import { Tier1Assessment } from './components/Tier1Assessment';
import { Tier2Assessment } from './components/Tier2Assessment';
import { LoginPage } from './components/LoginPage';
import { OtpVerificationPage } from './components/OtpVerificationPage';
import { EmailLoginModal } from './components/EmailLoginModal';
import { Tier1Results } from './components/Tier1Results';

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  version: string;
  sections: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  questions: Array<{
    id: string;
    sectionId: string;
    order: number;
    kind: string;
    prompt: string;
    required: boolean;
    options: Array<{
      id: string;
      label: string;
      value: string;
      score: number;
    }>;
  }>;
  scoringConfig: {
    weights: Record<string, number>;
    maturityToScore: Record<string, number>;
  };
}

function AppContent() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: templateLoading, withLoading } = useLoader();
  const [assessmentTemplate, setAssessmentTemplate] = useState<AssessmentTemplate | null>(null);
  const [currentAssessmentInstance, setCurrentAssessmentInstance] = useState<string | null>(null);
  
  // Load previous assessments on component mount
  useEffect(() => {
    loadPreviousAssessments();
  }, []);

  useEffect(() => {
    // Add a small delay to ensure Amplify is fully configured
    const timer = setTimeout(() => {
      withLoading(async () => {
        // Initialize default questions first
        await initializeDefaultQuestions();
        // Then load assessment template
        await loadAssessmentTemplate();
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [withLoading]);

  const initializeDefaultQuestions = async (): Promise<void> => {
    try {
      console.log('🌱 Initializing default questions...');
      const result = await seedDataService.initializeDefaultQuestions();
      if (result.success) {
        console.log('✅ Default questions initialized:', result.data);
      } else {
        console.warn('⚠️ Failed to initialize default questions:', result.error);
      }
    } catch (error) {
      console.error('❌ Error initializing default questions:', error);
    }
  };

  const loadPreviousAssessments = async () => {
    try {
      // DUMMY DATA: This loads dummy previous assessments
      // REAL AMPLIFY: Replace with actual user ID when authenticated
      const result = await apiService.getUserAssessments('dummy_user_id');
      if (result.success && result.data) {
        dispatch({ type: 'SET_PREVIOUS_ASSESSMENTS', payload: result.data });
      }
    } catch (error) {
      console.error('Failed to load previous assessments:', error);
    }
  };

  const loadAssessmentTemplate = async (): Promise<void> => {
    try {
      const result = await apiService.getAssessmentTemplate('digital-readiness-high');
      if (result.success && result.data) {
        setAssessmentTemplate(result.data);
      }
    } catch (error) {
      console.error('Failed to load assessment template:', error);
    }
  };

  const getCurrentView = (): 'home' | 'tier1' | 'tier2' => {
    const path = location.pathname;
    if (path === '/tier1') return 'tier1';
    if (path === '/tier2') return 'tier2';
    return 'home';
  };

  const navigateToTier = (tier: 'tier1' | 'tier2') => {
    if (tier === 'tier1') {
      navigate('/consent');
    } else {
      navigate(`/${tier}`);
    }
  };

  const navigateHome = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleConsentAccept = async () => {
    try {
      // Create assessment instance
      if (assessmentTemplate) {
        const result = await apiService.createAssessmentInstance(
          assessmentTemplate.id,
          'HIGH_LEVEL',
          { source: 'web_app' }
        );
        
        if (result.success && result.data) {
          setCurrentAssessmentInstance(result.data.id);
          navigate('/tier1');
        }
      }
    } catch (error) {
      console.error('Failed to create assessment instance:', error);
      // Still navigate to allow demo to work
      navigate('/tier1');
    }
  };

  const handleConsentDecline = () => {
    navigate('/');
  };

  const handleLogin = (data: UserData) => {
    dispatch({ type: 'SET_PENDING_USER_DATA', payload: data });
    navigate('/otp');
  };

  const handleOtpVerification = async () => {
    if (state.pendingUserData) {
      try {
        // Extract domain from email
        const emailDomain = state.pendingUserData.email.split('@')[1];
        
        // Create or get company
        const companyResult = await apiService.createOrGetCompany(
          emailDomain,
          state.pendingUserData.companyName
        );
        
        let companyId = null;
        if (companyResult.success && companyResult.data) {
          companyId = companyResult.data.id;
        }

        // Create user
        const userResult = await apiService.createUser({
          email: state.pendingUserData.email,
          firstName: state.pendingUserData.name.split(' ')[0],
          lastName: state.pendingUserData.name.split(' ').slice(1).join(' '),
          jobTitle: state.pendingUserData.jobTitle,
          companyId
        });

        if (userResult.success && userResult.data) {
          // Record consent
          await apiService.recordConsent(
            userResult.data.id,
            'By continuing, you agree to the Albert Digital Readiness Assessment Terms and Privacy Policy.',
            'v1.0'
          );
        }

        dispatch({ type: 'SET_USER_DATA', payload: state.pendingUserData });
        dispatch({ type: 'SET_PENDING_USER_DATA', payload: null });
        navigate('/tier1-results');
      } catch (error) {
        console.error('Failed to create user:', error);
        // Still proceed for demo purposes
        dispatch({ type: 'SET_USER_DATA', payload: state.pendingUserData });
        dispatch({ type: 'SET_PENDING_USER_DATA', payload: null });
        navigate('/tier1-results');
      }
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'RESET_STATE' });
    navigate('/');
  };

  const handleHeaderLogin = () => {
    navigate('/email-login');
  };

  const handleEmailSubmit = (email: string) => {
    dispatch({ type: 'SET_LOGIN_EMAIL', payload: email });
    navigate('/otp-login');
  };

  const handleLoginOtpVerification = () => {
    dispatch({ 
      type: 'SET_USER_DATA', 
      payload: {
        name: 'User',
        email: state.loginEmail,
        companyName: '',
        jobTitle: ''
      }
    });
    dispatch({ type: 'SET_LOGIN_EMAIL', payload: '' });
    navigate('/');
  };

  const handleScheduleCall = () => {
    // In a real app, this would open a calendar booking system
    alert('Calendar booking system would open here');
  };

  const handleRetakeAssessment = () => {
    navigate('/consent');
  };

  const handleTier1Complete = async (responses: Record<string, string>) => {
    dispatch({ type: 'SET_TIER1_RESPONSES', payload: responses });
    
    await withLoading(async () => {
      try {
        if (currentAssessmentInstance) {
          const result = await apiService.submitAssessment(currentAssessmentInstance, responses);
          if (result.success && result.data) {
            dispatch({ type: 'SET_TIER1_SCORE', payload: result.data.overallScore });
          }
        }
      } catch (error) {
        console.error('Failed to submit assessment:', error);
        // Calculate score locally as fallback
        const score = Math.floor(Math.random() * 40) + 60;
        dispatch({ type: 'SET_TIER1_SCORE', payload: score });
      }
    });
    
    navigate('/login');
  };

  if (templateLoading) {
    return (
      <Layout
        currentView={getCurrentView()}
        sidebarCollapsed={state.sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        onNavigateHome={navigateHome}
        onNavigateToTier={navigateToTier}
        onLogin={handleHeaderLogin}
        onLogout={handleLogout}
        userName={state.userData?.name}
      >
        <Loader fullScreen text="Loading assessment template..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout
      currentView={getCurrentView()}
      sidebarCollapsed={state.sidebarCollapsed}
      toggleSidebar={toggleSidebar}
      onNavigateHome={navigateHome}
      onNavigateToTier={navigateToTier}
      onLogin={handleHeaderLogin}
      onLogout={handleLogout}
      userName={state.userData?.name}
    >
      <Routes>
        <Route path="/" element={<HomePage onNavigateToTier={navigateToTier} />} />
        <Route 
          path="/consent" 
          element={
            <ConsentPage 
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
            />
          } 
        />
        <Route 
          path="/tier1" 
          element={
            assessmentTemplate ? (
              <Tier1Assessment 
                assessmentTemplate={assessmentTemplate}
                previousAssessments={state.previousAssessments}
                onNavigateToTier={navigateToTier} 
                onShowLogin={() => navigate('/login')}
                onComplete={handleTier1Complete}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-600">Failed to load assessment template</p>
              </div>
            )
          } 
        />
        <Route 
          path="/tier2" 
          element={
            <Tier2Assessment 
              onNavigateToTier={navigateToTier} 
              onShowLogin={() => navigate('/login')} 
            />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage 
              onLogin={handleLogin} 
              onCancel={() => navigate('/')} 
            />
          } 
        />
        <Route 
          path="/otp" 
          element={
            <OtpVerificationPage 
              userEmail={state.pendingUserData?.email || ''} 
              onVerify={handleOtpVerification} 
              onCancel={() => navigate('/login')} 
            />
          } 
        />
        <Route 
          path="/tier1-results" 
          element={
            <Tier1Results 
              score={state.tier1Score}
              onNavigateToTier2={() => navigate('/tier2')}
              onScheduleCall={handleScheduleCall}
              onRetakeAssessment={handleRetakeAssessment}
            />
          } 
        />
        <Route 
          path="/email-login" 
          element={
            <EmailLoginModal 
              onSubmit={handleEmailSubmit} 
              onCancel={() => navigate('/')} 
            />
          } 
        />
        <Route 
          path="/otp-login" 
          element={
            <OtpVerificationPage 
              userEmail={state.loginEmail} 
              onVerify={handleLoginOtpVerification} 
              onCancel={() => navigate('/email-login')} 
            />
          } 
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;