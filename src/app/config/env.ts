import { z } from "zod";

const EnvSchema = z.object({
  NEXT_OPENAI_API_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SERVER_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_CLIENT_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// For Next.js, use process.env instead of import.meta.env
const env: Partial<EnvSchema> = {
  NEXT_OPENAI_API_KEY: process.env.NEXT_OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
};

export default env;
