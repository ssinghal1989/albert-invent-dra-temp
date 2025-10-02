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
    console.log("🚀 [submitTier1Assessment] Starting assessment submission", {
      isAnonymous,
      hasUser: !!user,
      hasCompany: !!company,
      hasTier1Score: !!tier1Score,
      hasTier1Responses: !!tier1Responses,
      stateUserId: state.userData?.id,
      stateCompanyId: state.company?.id
    });

    setSubmittingAssesment(true);
    try {
      // For anonymous assessments, we don't need user/company data
      if (!isAnonymous) {
        console.log("📝 [submitTier1Assessment] Processing authenticated assessment");
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
        console.log("👤 [submitTier1Assessment] Processing anonymous assessment");
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
        console.log("🔍 [submitTier1Assessment] Generated device fingerprint", {
          deviceId: deviceFingerprint.fingerprint,
          userAgent: deviceFingerprint.userAgent.substring(0, 50) + "...",
          screenResolution: deviceFingerprint.screenResolution,
          timezone: deviceFingerprint.timezone
        });
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
        console.log("🔐 [submitTier1Assessment] Added authenticated user data", {
          companyId: assessmentData.companyId,
          initiatorUserId: assessmentData.initiatorUserId
        });
      } else {
        // Add device fingerprint metadata for anonymous users
        assessmentData.metadata = JSON.stringify({
          isAnonymous: true,
          deviceFingerprint: deviceFingerprint,
          deviceId: deviceFingerprint?.fingerprint,
          timestamp: new Date().toISOString(),
        });
        console.log("📱 [submitTier1Assessment] Added anonymous metadata", {
          deviceId: deviceFingerprint?.fingerprint,
          metadataSize: JSON.stringify(assessmentData.metadata).length
        });
      }

      console.log("💾 [submitTier1Assessment] Creating assessment instance...");
      const { data } = await client.models.AssessmentInstance.create(assessmentData, {authMode: 'apiKey'});
      console.log("✅ [submitTier1Assessment] Assessment instance created", {
        assessmentId: data?.id,
        templateId: data?.templateId,
        assessmentType: data?.assessmentType
      });
      
      // Create tracking record for anonymous assessments
      if (isAnonymous && data && deviceFingerprint) {
        console.log("🔗 [submitTier1Assessment] Creating anonymous tracking record...");
        try {
          const trackingData = {
            deviceId: deviceFingerprint.fingerprint,
            assessmentInstanceId: data.id,
            deviceFingerprint: JSON.stringify(deviceFingerprint),
            isLinked: false,
          };
          console.log("📊 [submitTier1Assessment] Tracking data prepared", trackingData);
          
          const trackingResult = await client.models.AnonymousAssessment.create(trackingData, {
            authMode: 'apiKey'
          });
          console.log("✅ [submitTier1Assessment] Anonymous tracking record created", {
            trackingId: trackingResult.data?.id,
            deviceId: trackingResult.data?.deviceId,
            isLinked: trackingResult.data?.isLinked
          });
        } catch (trackingError) {
          console.error("❌ [submitTier1Assessment] Error creating anonymous assessment tracking record:", trackingError);
          // Don't fail the whole operation if tracking fails
        }
      }
      
      // Store anonymous assessment ID for later linking
      if (isAnonymous && data) {
        dispatch({ type: "SET_ANONYMOUS_ASSESSMENT_ID", payload: data.id });
        console.log("🔄 [submitTier1Assessment] Stored anonymous assessment ID in state", {
          assessmentId: data.id
        });
      }

      console.log("🎉 [submitTier1Assessment] Assessment submission completed successfully");
      setSubmittingAssesment(false);
      return data;
    } catch (err) {
      console.error("❌ [submitTier1Assessment] Assessment submission failed:", err);
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
      console.log("🔍 [findAndLinkAnonymousAssessments] Starting search for anonymous assessments", {
        userId,
        companyId
      });
      
      try {
        const deviceFingerprint = getDeviceFingerprint();
        console.log("📱 [findAndLinkAnonymousAssessments] Got device fingerprint", {
          deviceId: deviceFingerprint.fingerprint,
          userAgent: deviceFingerprint.userAgent.substring(0, 50) + "...",
          screenResolution: deviceFingerprint.screenResolution
        });
        
        // Efficiently search for anonymous assessments by deviceId
        console.log("🔎 [findAndLinkAnonymousAssessments] Searching for unlinked anonymous assessments...");
        const { data: anonymousAssessments } = await client.models.AnonymousAssessment.list({
          filter: {
            deviceId: { eq: deviceFingerprint.fingerprint },
            isLinked: { eq: false }
          },
          authMode: 'apiKey'
        });
        console.log("📊 [findAndLinkAnonymousAssessments] Search results", {
          foundCount: anonymousAssessments?.length || 0,
          assessments: anonymousAssessments?.map(a => ({
            id: a.id,
            deviceId: a.deviceId,
            assessmentInstanceId: a.assessmentInstanceId,
            isLinked: a.isLinked
          }))
        });
        
        if (!anonymousAssessments || anonymousAssessments.length === 0) {
          console.log("ℹ️ [findAndLinkAnonymousAssessments] No unlinked anonymous assessments found");
          return [];
        }

        // Link all unlinked anonymous assessments for this device
        console.log("🔗 [findAndLinkAnonymousAssessments] Starting linking process for", anonymousAssessments.length, "assessments");
        const linkedAssessments = [];
        for (const anonymousAssessment of anonymousAssessments) {
          console.log("🔄 [findAndLinkAnonymousAssessments] Processing assessment", {
            trackingId: anonymousAssessment.id,
            assessmentInstanceId: anonymousAssessment.assessmentInstanceId
          });
          
          try {
            // Update the actual assessment instance
            console.log("📝 [findAndLinkAnonymousAssessments] Updating assessment instance...");
            const { data: updatedAssessment } = await client.models.AssessmentInstance.update({
              id: anonymousAssessment.assessmentInstanceId,
              initiatorUserId: userId,
              companyId: companyId,
              metadata: JSON.stringify({
                wasAnonymous: true,
                linkedAt: new Date().toISOString(),
                originalDeviceId: deviceFingerprint.fingerprint,
              }),
            });
            console.log("✅ [findAndLinkAnonymousAssessments] Assessment instance updated", {
              assessmentId: updatedAssessment?.id,
              newInitiatorUserId: updatedAssessment?.initiatorUserId,
              newCompanyId: updatedAssessment?.companyId
            });
            
            // Update the tracking record
            console.log("📊 [findAndLinkAnonymousAssessments] Updating tracking record...");
            await client.models.AnonymousAssessment.update({
              id: anonymousAssessment.id,
              isLinked: true,
              linkedUserId: userId,
              linkedCompanyId: companyId,
              linkedAt: new Date().toISOString(),
            }, {
              authMode: 'apiKey'
            });
            console.log("✅ [findAndLinkAnonymousAssessments] Tracking record updated", {
              trackingId: anonymousAssessment.id,
              isLinked: true,
              linkedUserId: userId
            });
            
            const linked = updatedAssessment;
            if (linked) {
              linkedAssessments.push(linked);
              console.log("📋 [findAndLinkAnonymousAssessments] Added to linked assessments list");
            }
          } catch (err) {
            console.error(`❌ [findAndLinkAnonymousAssessments] Failed to link anonymous assessment ${anonymousAssessment.id}:`, err);
          }
        }

        // Clear anonymous assessment ID after linking
        if (linkedAssessments.length > 0) {
          dispatch({ type: "SET_ANONYMOUS_ASSESSMENT_ID", payload: null });
          console.log("🔄 [findAndLinkAnonymousAssessments] Cleared anonymous assessment ID from state");
        }

        console.log("🎉 [findAndLinkAnonymousAssessments] Linking process completed", {
          totalProcessed: anonymousAssessments.length,
          successfullyLinked: linkedAssessments.length,
          linkedAssessmentIds: linkedAssessments.map(a => a.id)
        });
        return linkedAssessments;
      } catch (err) {
        console.error("❌ [findAndLinkAnonymousAssessments] Error finding and linking anonymous assessments:", err);
        return [];
      }
    },
    [dispatch]
  );

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
      
      await client.models.AssessmentInstance.create(assessmentData, {authMode: 'apiKey'});
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
