import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'albertInventStorage',
  access: (allow) => ({
    'assessment-files/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'public-assets/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});