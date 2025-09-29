import { useCallback, useState } from "react";
import { client } from "../amplifyClient";
import { Tier2FormData, useAppContext, UserData } from "../context/AppContext"; // adjust path

export function useUserForm() {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);

  const updateMissingDataForLoggedInUser = useCallback(
    async (formData: UserData | Tier2FormData) => {
      try {
        setLoading(true);
        if (state.company && (state.company.name !== formData.companyName)) {
          const { data: updatedCompany } = await client.models.Company.update({
            id: state.company?.id,
            name: formData.companyName,
          });
          dispatch({ type: "SET_COMPANY_DATA", payload: updatedCompany });
        }
        if (
          state?.userData &&
          (state.userData.name !== formData.name ||
            state.userData.jobTitle !== formData.jobTitle)
        ) {
          const { data: updatedUser } = await client.models.User.update({
            id: state?.userData?.id,
            name: formData.name,
            jobTitle: formData.jobTitle,
          });
          dispatch({ type: "SET_USER_DATA", payload: updatedUser });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Error updating user/company data:", err);
        // Optionally, set an error state to inform the user
      }
    },
    [dispatch]
  );

  return { updateMissingDataForLoggedInUser, loading };
}
