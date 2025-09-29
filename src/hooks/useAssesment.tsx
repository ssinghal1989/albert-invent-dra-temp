import { useCallback, useEffect, useState } from "react";
import { client, LocalSchema } from "../amplifyClient";
import { useAppContext } from "../context/AppContext"; // adjust path
import { Tier1TemplateId } from "../services/defaultQuestions";
import { Tier1ScoreResult } from "../utils/scoreCalculator";

type Tier1AssessmentRequest = {
  user?: LocalSchema["User"]["type"];
  company?: LocalSchema["Company"]["type"];
  tier1Score?: Tier1ScoreResult;
  tier1Responses?: Record<string, string>;
};

export function useAssessment() {
  const [userAssessments, setUserAssessments] = useState<Record<string, any>[]>(
    []
  );
  const [userTier1Assessments, setUserTier1Assessments] = useState<
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
  }: Tier1AssessmentRequest) => {
    setSubmittingAssesment(true);
    try {
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
      // Create a new assessment instance for user
      const assessmentData = {
        templateId: Tier1TemplateId, // Assuming a fixed template ID for Tier 1
        companyId: state.userData?.companyId || company?.id,
        initiatorUserId: state?.userData?.id || user?.id,
        assessmentType: "TIER1" as "TIER1",
        score: JSON.stringify(tier1Score || state.tier1Score), // Store the score as JSON
        responses: JSON.stringify(tier1Responses || state.tier1Responses), // Store the responses as JSON
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await client.models.AssessmentInstance.create(assessmentData);
      setSubmittingAssesment(false);
    } catch (err) {
      setSubmittingAssesment(false);
      console.error("Error in submitting assessment");
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
    fetchUserAssessments,
    updateTier1AssessmentResponse,
    userAssessments,
    userTier1Assessments,
    submittingAssesment,
    setSubmittingAssesment,
  };
}
