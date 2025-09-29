import { Handler } from "aws-lambda";
import { SES, CognitoIdentityServiceProvider } from "aws-sdk";

const ses = new SES();
const cognito = new CognitoIdentityServiceProvider();

export const handler: Handler = async (event: any) => {
  const { userPoolId, userName, request, callerContext } = event;
  
  // 🛑 Step 1: If user is UNCONFIRMED → resend Cognito confirmation code
  if (request.userAttributes?.["cognito:user_status"] === "UNCONFIRMED") {
    try {
      await cognito
        .resendConfirmationCode({
          ClientId: callerContext.clientId,
          Username: userName,
        })
        .promise();

      event.response.publicChallengeParameters = {
        message:
          "Please confirm your email. A new signup verification code has been sent.",
      };
      event.response.privateChallengeParameters = {};
      event.response.challengeMetadata = "RESEND_SIGNUP_OTP";

      return event; // ✅ exit early, don’t send custom OTP
    } catch (err) {
      console.error("❌ Error resending confirmation code:", err);
      throw err;
    }
  }

  if (event.triggerSource === "CreateAuthChallenge_Authentication") {
    // ✅ Resolve email
    let email: string | undefined;

    if (event.request.userNotFound && event.userName.includes("@")) {
      // New user logging in with email → signal frontend to call signup
      const error = new Error("New user detected");
      (error as any).code = "NewUserException";
      throw error;
    } else if (!event.request.userAttributes?.email) {
      // Email not found in payload, assume a new user
      const error = new Error("New user detected");
      (error as any).code = "NewUserException";
      throw error;
    } else {
      // Existing user → rely on stored attribute
      email = event.request.userAttributes?.email;
    }

    if (!email || !email.includes("@")) {
      throw new Error(`Invalid email: ${email}`);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    event.response.privateChallengeParameters = { otp };
    event.response.challengeMetadata = "EMAIL_OTP";
    event.response.publicChallengeParameters = { email };

    // try {
    //   await ses
    //     .sendEmail({
    //       Destination: { ToAddresses: [email] },
    //       Message: {
    //         Body: { Text: { Data: `Your OTP is: ${otp}` } },
    //         Subject: { Data: "Your OTP Code" },
    //       },
    //       Source: "ssinghal1989@gmail.com", // must be SES-verified
    //     })
    //     .promise();
    // } catch (err) {
    //   console.error("❌ Failed to send email:", err);
    //   throw err;
    // }
  }

  return event;
};
