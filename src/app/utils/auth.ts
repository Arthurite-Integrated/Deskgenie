import { betterAuth } from "better-auth"
import env from "../config/env"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db"
 
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  socialProviders: {
    google: { 
      clientId: env.GOOGLE_CLIENT_ID as string, 
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline", 
      prompt: "select_account+consent",
      scope: [
        "openid",
        "profile",
        "email",
        "https://www.googleapis.com/auth/calendar",
      ],
      // redirectURI: 'http://localhost:3000'
    }, 
  },
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:5173"],
})