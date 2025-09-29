import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    name: {
      required: true,
      mutable: true,
    },
  },
  accountRecovery: 'EMAIL_ONLY',
});