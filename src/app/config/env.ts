import { z } from "zod";

const EnvSchema = z.object({
  NEXT_OPENAI_API_KEY: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// For Next.js, use process.env instead of import.meta.env
const env: Partial<EnvSchema> = {
  NEXT_OPENAI_API_KEY: process.env.NEXT_OPENAI_API_KEY
};

export default env;
