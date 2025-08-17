import { createAuthClient } from "better-auth/client";
import env from "../config/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL, // Use environment variable instead of hardcoded localhost
  plugins: [],
});

export const { signIn, signOut, useSession } = authClient;

export const requestGoogleCalenderAccess = async () => {
  await authClient.linkSocial({
    provider: "google",
    callbackURL: `${env.NEXT_PUBLIC_CLIENT_URL}/genie`,
    fetchOptions: {
      credentials: "include"
    }
  });
};
