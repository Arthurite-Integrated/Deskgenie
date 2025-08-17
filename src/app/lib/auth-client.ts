import { createAuthClient } from "better-auth/client";
import env from "../config/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL, // Your Hono server URL
  plugins: [],
});

export const { signIn, signOut, useSession } = authClient;

export const requestGoogleCalenderAccess = async () => {
  await authClient.linkSocial({
    provider: "google",
    callbackURL: `${env.BASE_URL}/genie`,
    fetchOptions: {
      credentials: "include"
    }
  });
};
