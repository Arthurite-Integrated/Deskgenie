import env from '@/app/config/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/app/db/migrations',
  schema: './src/app/db/schema.ts',
  dialect: "postgresql",
  dbCredentials: {
    url: env.NEXT_DATABASE_URL!
  } 
})