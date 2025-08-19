import { z } from "zod";

const EnvSchema = z.object({
  NEXT_OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SERVER_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_CLIENT_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
  NEXT_DATABASE_URL: z.string().optional(),
  NEXT_GENIE_MAIL: z.string().optional().default('official.genie.ai@gmail.com'),
  NEXT_GENIE_MAIL_PASSWORD: z.string().optional()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// Debug: Check what environment variables are available
console.log("Environment variables check:", {
  NEXT_GENIE_MAIL: process.env.NEXT_GENIE_MAIL ? "✓ Found" : "✗ Missing",
  NEXT_GENIE_MAIL_PASSWORD: process.env.NEXT_GENIE_MAIL_PASSWORD ? "✓ Found" : "✗ Missing",
  NODE_ENV: process.env.NODE_ENV
});

// For Next.js, use process.env instead of import.meta.env
const env = EnvSchema.parse({
  NEXT_OPENAI_API_KEY: process.env.NEXT_OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  NEXT_DATABASE_URL: process.env.NEXT_DATABASE_URL,
  NEXT_GENIE_MAIL: process.env.NEXT_GENIE_MAIL,
  NEXT_GENIE_MAIL_PASSWORD: process.env.NEXT_GENIE_MAIL_PASSWORD
});

console.log(env)

export default env;
