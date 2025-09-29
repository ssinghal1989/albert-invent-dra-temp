import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any) => {
  // New session → request an OTP
  if (event.request.session.length === 0) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  } else {
    // Look at the last challenge
    const lastChallenge = event.request.session.slice(-1)[0];
    const challengeResult = lastChallenge.challengeResult;

    if (challengeResult) {
      // OTP was correct
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else if (event.request.session.length >= 3) {
      // Too many failed attempts
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    } else {
      // Retry challenge
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = "CUSTOM_CHALLENGE";
    }
  }

  return event;
};
