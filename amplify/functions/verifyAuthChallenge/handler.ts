import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any) => {
  const expectedOtp = event.request.privateChallengeParameters?.otp;
  const userAnswer = event.request.challengeAnswer;

  event.response.answerCorrect = userAnswer === expectedOtp;

  return event;
};
