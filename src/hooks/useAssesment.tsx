import { useCallback, useEffect, useState } from "react";
import { client, LocalSchema } from "../amplifyClient";
import { useAppContext } from "../context/AppContext"; // adjust path
import { Tier1TemplateId, Tier2TemplateId } from "../services/defaultQuestions";
import { Tier1ScoreResult } from "../utils/scoreCalculator";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";

type Tier1AssessmentRequest = {
  user?: LocalSchema["User"]["type"];
  company?: LocalSchema["Company"]["type"];
  tier1Score?: Tier1ScoreResult;
  tier1Responses?: Record<string, string>;
  isAnonymous?: boolean;
};

export function useAssessment() {
  const [userAssessments, setUserAssessments] = useState<Record<string, any>[]>(
    []
  );
  const [userTier1Assessments, setUserTier1Assessments] = useState<
    Record<string, any>[]
  >([]);
  const [userTier2Assessments, setUserTier2Assessments] = useState<
    Record<string, any>[]
  >([]);
  const [submittingAssesment, setSubmittingAssesment] =
    useState<boolean>(false);
  const { dispatch, state } = useAppContext();

  useEffect(() => {
    if (!!state.loggedInUserDetails?.userId) {
      fetchUserAssessments();
    }
  }, [state.loggedInUserDetails?.userId]);

  useEffect(() => {
    if (userAssessments.length > 0) {
      const tier1Instances = (userAssessments ?? []).filter(
        (instance) => instance?.assessmentType === "TIER1"
      );
      setUserTier1Assessments(tier1Instances);
      
      const tier2Instances = (userAssessments ?? []).filter(
        (instance) => instance?.assessmentType === "TIER2"
      );
      setUserTier2Assessments(tier2Instances);
      
      if (tier1Instances.length > 0) {
        dispatch({
          type: "SET_TIER1_SCORE",
          payload:
            typeof tier1Instances[0]?.score === "string"
              ? (JSON.parse(tier1Instances[0]?.score) as Tier1ScoreResult)
              : null,
        });
      }
    }
  }, [userAssessments]);

  const fetchUserAssessments = useCallback(async () => {
    if (!state.loggedInUserDetails?.userId) return;

    try {
      const { data } =
        await client.models.AssessmentInstance.listAssessmentInstanceByInitiatorUserIdAndCreatedAt(
          {
            initiatorUserId: state.loggedInUserDetails?.userId,
          }
        );
      setUserAssessments(
        data.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        ) || []
      );
    } catch (error) {
      console.error("Error fetching user assessments:", error);
    }
  }, [dispatch, state.loggedInUserDetails?.userId]);

  const submitTier1Assessment = async ({
    user,
    company,
    tier1Score,
    tier1Responses,
    isAnonymous = false,
  }: Tier1AssessmentRequest) => {
    setSubmittingAssesment(true);
    try {
      // For anonymous assessments, we don't need user/company data
      if (!isAnonymous) {
        if (
          (!state.tier1Responses && !tier1Score) ||
          (!state.tier1Score && !tier1Responses) ||
          (!state.userData && !user) ||
          (!state.company && !company)
        ) {
          console.error("Data missing for submitting Tier 1 assessment");
          setSubmittingAssesment(false);
          return;
        }
      } else {
        // For anonymous, we just need score and responses
        if ((!state.tier1Responses && !tier1Responses) || (!state.tier1Score && !tier1Score)) {
          console.error("Score and responses missing for anonymous assessment");
          setSubmittingAssesment(false);
          return;
        }
      }

      // Get device fingerprint for anonymous users
      let deviceFingerprint = null;
      if (isAnonymous) {
        deviceFingerprint = getDeviceFingerprint();
      }

      // Create assessment data
      const assessmentData: any = {
        templateId: Tier1TemplateId,
        assessmentType: "TIER1" as "TIER1",
        score: JSON.stringify(tier1Score || state.tier1Score),
        responses: JSON.stringify(tier1Responses || state.tier1Responses),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add user/company data for authenticated users
      if (!isAnonymous) {
        assessmentData.companyId = state.userData?.companyId || company?.id;
        assessmentData.initiatorUserId = state?.userData?.id || user?.id;
      } else {
        // Add device fingerprint metadata for anonymous users
        assessmentData.metadata = JSON.stringify({
          isAnonymous: true,
          deviceFingerprint: deviceFingerprint,
          deviceId: deviceFingerprint?.fingerprint,
          timestamp: new Date().toISOString(),
        });
      }

      const { data } = await client.models.AssessmentInstance.create(assessmentData);
      
      // Store anonymous assessment ID for later linking
      if (isAnonymous && data) {
        dispatch({ type: "SET_ANONYMOUS_ASSESSMENT_ID", payload: data.id });
      }

      setSubmittingAssesment(false);
      return data;
    } catch (err) {
      setSubmittingAssesment(false);
      console.error("Error in submitting assessment:", err);
      throw err;
    }
  };

  // New method to link anonymous assessment with user after signup
  const linkAnonymousAssessment = useCallback(
    async (assessmentId: string, userId: string, companyId: string) => {
      try {
        const { data } = await client.models.AssessmentInstance.update({
          id: assessmentId,
          initiatorUserId: userId,
          companyId: companyId,
          metadata: JSON.stringify({
            wasAnonymous: true,
            linkedAt: new Date().toISOString(),
          }),
        });
        
        // Clear anonymous assessment ID after linking
        dispatch({ type: "SET_ANONYMOUS_ASSESSMENT_ID", payload: null });
        
        return data;
      } catch (err) {
        console.error("Error linking anonymous assessment:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Enhanced method to find and link anonymous assessments by device fingerprint
  const findAndLinkAnonymousAssessments = useCallback(
    async (userId: string, companyId: string) => {
      try {
        const deviceFingerprint = getDeviceFingerprint();
        
        // Efficiently search for anonymous assessments by deviceId
        const { data: anonymousAssessments } = await client.models.AnonymousAssessment.list({
          filter: {
            deviceId: { eq: deviceFingerprint.fingerprint },
            isLinked: { eq: false }
          },
          authMode: 'apiKey'
        });
        
        if (!anonymousAssessments || anonymousAssessments.length === 0) {
          return [];
        }

        // Link all unlinked anonymous assessments for this device
        const linkedAssessments = [];
        for (const anonymousAssessment of anonymousAssessments) {
          try {
            const linked = await linkAnonymousAssessment(
              anonymousAssessment.id, 
              anonymousAssessment.assessmentInstanceId, 
              userId, 
              companyId
            );
            if (linked) linkedAssessments.push(linked);
          } catch (err) {
            console.error(`Failed to link anonymous assessment ${anonymousAssessment.id}:`, err);
          }
        }

        return linkedAssessments;
      } catch (err) {
        console.error("Error finding and linking anonymous assessments:", err);
        return [];
      }
    }
  )

  const submitTier2Assessment = async (responses: Record<string, string>) => {
    setSubmittingAssesment(true);
    try {
      if (!state.userData || !state.company) {
        console.error("User data missing for submitting Tier 2 assessment");
        setSubmittingAssesment(false);
        return;
      }
      
      // Create a new assessment instance for user
      const assessmentData = {
        templateId: Tier2TemplateId,
        companyId: state.userData?.companyId,
        initiatorUserId: state?.userData?.id,
        assessmentType: "TIER2" as "TIER2",
        responses: JSON.stringify(responses),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await client.models.AssessmentInstance.create(assessmentData);
      await fetchUserAssessments();
      setSubmittingAssesment(false);
    } catch (err) {
      setSubmittingAssesment(false);
      console.error("Error in submitting Tier 2 assessment:", err);
    }
  };
  const updateTier1AssessmentResponse = useCallback(
    async ({
      assessmentId,
      updatedResponses,
      updatedScores,
    }: {
      assessmentId: string;
      updatedResponses: any;
      updatedScores: Tier1ScoreResult;
    }) => {
      try {
        setSubmittingAssesment(true);
        await client.models.AssessmentInstance.update({
          id: assessmentId,
          responses: JSON.stringify(updatedResponses),
          score: JSON.stringify(updatedScores),
        });
        await fetchUserAssessments();
        setSubmittingAssesment(false);
      } catch (err) {
        setSubmittingAssesment(false);
      }
    },
    [dispatch]
  );

  return {
    submitTier1Assessment,
    submitTier2Assessment,
    fetchUserAssessments,
    updateTier1AssessmentResponse,
    linkAnonymousAssessment,
    findAndLinkAnonymousAssessments,
    userAssessments,
    userTier1Assessments,
    userTier2Assessments,
    submittingAssesment,
    setSubmittingAssesment,
  };
}
