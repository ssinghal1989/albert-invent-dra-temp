import { useCallback } from "react";
import { client } from "../amplifyClient";
import { getCompanyNameFromDomain, getDomainFromEmail } from "../utils/common";
import { AuthUser } from "aws-amplify/auth";
import { useAppContext } from "../context/AppContext"; // adjust path

export function useSetUserData() {
  const { dispatch } = useAppContext();

  const setUserData = useCallback(
    async ({
      loggedInUserDetails,
      companyName,
      userFullName,
      userJobTitle,
    }: {
      loggedInUserDetails: AuthUser;
      companyName?: string;
      userFullName?: string;
      userJobTitle?: string;
    }) => {
      let { data: user, errors } = await client.models.User.get({
        id: loggedInUserDetails.userId,
      });

      // 🔹 Case 1: User does NOT exist → Create new user + company
      if (!user && !errors) {
        const { data: newUser } = await client.models.User.create({
          id: loggedInUserDetails.userId,
          email: loggedInUserDetails.signInDetails?.loginId!,
          name: userFullName || "",
          jobTitle: userJobTitle || "",
          role: 'user',
        });
        user = newUser;

        const companyDomain = getDomainFromEmail(
          loggedInUserDetails.signInDetails?.loginId || ""
        );
        let { data: companies } = await client.models.Company.list({
          filter: { primaryDomain: { eq: companyDomain! } },
        });

        let companyData =
          companies?.length && companies[0]
            ? companies[0]
            : (
                await client.models.Company.create({
                  primaryDomain: companyDomain!,
                  name:
                    companyName ||
                    getCompanyNameFromDomain(companyDomain!) ||
                    "",
                })
              )?.data;

        if (user && !user.companyId && companyData) {
          const response = await client.models.User.update({
            id: user.id,
            companyId: companyData.id,
          });
          user = response?.data;
        }

        const company = await user?.company();
        dispatch({ type: "SET_USER_DATA", payload: user });
        dispatch({ type: "SET_COMPANY_DATA", payload: company?.data || null });
        return { user, company: company?.data || null };
      }

      // 🔹 Case 2: User already exists → Update details if params are passed
      if (user) {
        let shouldUpdateUser = false;
        const updatePayload: Record<string, any> = { id: user.id };

        if (userFullName && user.name !== userFullName) {
          updatePayload.name = userFullName;
          shouldUpdateUser = true;
        }
        if (userJobTitle && user.jobTitle !== userJobTitle) {
          updatePayload.jobTitle = userJobTitle;
          shouldUpdateUser = true;
        }

        // Handle company update if companyName is passed
        let company = await user.company();
        if (companyName && company?.data?.name !== companyName) {
          if (company?.data) {
            // Update existing company
            const { data: updatedCompany } = await client.models.Company.update({
              id: company.data.id,
              name: companyName,
            });
            company = { data: updatedCompany };
          }
        }

        if (shouldUpdateUser) {
          const { data: updatedUser } = await client.models.User.update(
            {
                id: user.id,
                ...updatePayload,
            }
          );
          user = updatedUser;
        }

        dispatch({ type: "SET_USER_DATA", payload: user });
        dispatch({ type: "SET_COMPANY_DATA", payload: company?.data || null });

        return { user, company: company?.data || null };
      }

      return { user: null, company: null };
    },
    [dispatch]
  );

  return { setUserData };
}
