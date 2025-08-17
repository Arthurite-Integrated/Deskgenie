import { z } from "zod";
// import { config } from 'dotenv'

// config({ path: '.env' })

const EnvSchema = z.object({
  VITE_SERVER_URL: z.string().default("http://localhost:3000"),
  VITE_CLIENT_URL: z.string().default("http://localhost:3000"),
  VITE_AGENT: z.string().default("agent"),
  BASE_URL: z.string().default("http://localhost:3000"),
  DEV: z.boolean().default(process.env.NODE_ENV === "development"),
  MODE: z.string().default(process.env.NODE_ENV || "development"),
  PROD: z.boolean().default(process.env.NODE_ENV === "production"),
  SSR: z.boolean().default(true),
  VITE_TELEGRAM_BOT_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// For Next.js, use process.env instead of import.meta.env
const env: Partial<EnvSchema> = {
  VITE_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  VITE_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
  VITE_AGENT: process.env.NEXT_PUBLIC_AGENT || "agent",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  DEV: process.env.NODE_ENV === "development",
  MODE: process.env.NODE_ENV || "development",
  PROD: process.env.NODE_ENV === "production",
  SSR: true,
  VITE_TELEGRAM_BOT_URL: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  OPENAI_API_KEY: process.env.NEXT_OPENAI_API_KEY
};

export default env;
