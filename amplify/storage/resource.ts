import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "assessmentReports",
  access: (allow) => ({
    "assessment-reports/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});
