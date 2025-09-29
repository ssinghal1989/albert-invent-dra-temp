import { signIn, signOut } from "aws-amplify/auth";

export async function checkIfUserExists(username: string): Promise<boolean> {
  try {
    await signIn({ username, password: "Temp@123" });
    await signOut();
    return true;
  } catch (error: any) {
    return false;
  }
}
