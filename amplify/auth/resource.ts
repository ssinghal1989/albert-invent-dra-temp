import { defineAuth } from '@aws-amplify/backend';
import * as amplify from "@aws-amplify/backend";
import { signUp } from 'aws-amplify/auth';

const defineAuthChallenge = amplify.defineFunction({
  name: "defineAuthChallenge",
  entry: "../functions/defineAuthChallenge/handler.ts",
});

const createAuthChallenge = amplify.defineFunction({
  name: "createAuthChallenge",
  entry: "../functions/createAuthChallenge/handler.ts",
});

const verifyAuthChallenge = amplify.defineFunction({
  name: "verifyAuthChallenge",
  entry: "../functions/verifyAuthChallenge/handler.ts",
});


/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
    },
  },
  userAttributes: {
    email: {required: true}
  },
  multifactor: {
    mode: 'OFF'
  },
  triggers: {
    defineAuthChallenge,
    createAuthChallenge,
    verifyAuthChallengeResponse: verifyAuthChallenge,
  },
})
