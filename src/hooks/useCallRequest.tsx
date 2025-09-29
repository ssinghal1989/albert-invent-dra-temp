import { useCallback, useEffect, useState } from "react";
import { client, LocalSchema } from "../amplifyClient";
import { useAppContext } from "../context/AppContext"; // adjust path

export type ScheduleRequest = {
  preferredDate: string; // e.g., "2025-09-29" (ISO date without time)
  preferredTimes: string[]; // assuming it's an array of selected times
  initiatorUserId?: string; // optional because of ?.
  companyId?: string; // optional because of ?.
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"; // enum-like string union
  type: "TIER1_FOLLOWUP" | "TIER2_REQUEST"; // expand as needed
  remarks?: string;
  assessmentInstanceId?: string;
  metadata: string; // JSON stringified object
};

export function useCallRequest() {
  const [userScheduledCalls, setUserScheduledCalls] = useState<
    LocalSchema["ScheduleRequest"]["type"][]
  >([]);
  const [tier1FollowUpRequests, setTier1FollowUpRequests] = useState<
    LocalSchema["ScheduleRequest"]["type"][]
  >([]);
  const [tier2AssessmentRequests, setTier2AssessmentRequests] = useState<
    LocalSchema["ScheduleRequest"]["type"][]
  >([]);

  const { dispatch, state } = useAppContext();

  useEffect(() => {
    if (!!state.userData?.id) {
      fetchUserCallRequests();
    }
  }, [state.userData?.id]);

  useEffect(() => {
    if (userScheduledCalls.length > 0) {
      const tier1FollowUpRequest = (userScheduledCalls ?? []).filter(
        (instance) => instance?.type === "TIER1_FOLLOWUP"
      );
      setTier1FollowUpRequests([...tier1FollowUpRequest]);
      const tier2AssessmentRequests = (userScheduledCalls ?? []).filter(
        (instance) => instance?.type === "TIER2_REQUEST"
      );
      setTier2AssessmentRequests([...tier2AssessmentRequests]);
    }
  }, [userScheduledCalls]);

  const fetchUserCallRequests = useCallback(async () => {
    if (!state.userData?.id) return;

    try {
      const { data } =
        await client.models.ScheduleRequest.listScheduleRequestByInitiatorUserIdAndCreatedAt(
          {
            initiatorUserId: state.userData?.id,
          }
        );
      setUserScheduledCalls(
        data
          ? [
              ...data.sort(
                (a, b) =>
                  new Date(b.createdAt ?? 0).getTime() -
                  new Date(a.createdAt ?? 0).getTime()
              ),
            ]
          : []
      );
    } catch (error) {
      console.error("Error fetching user assessments:", error);
    }
  }, [dispatch, state.userData?.id]);

  const scheduleRequest = useCallback(
    async (payload: ScheduleRequest) => {
      try {
        const { data, errors } = await client.models.ScheduleRequest.create(
          payload
        );
        return { data, errors };
      } catch (error) {
        throw error;
      }
    },
    [client]
  );

  return {
    userScheduledCalls,
    tier1FollowUpRequests,
    tier2AssessmentRequests,
    fetchUserCallRequests,
    scheduleRequest,
  };
}
