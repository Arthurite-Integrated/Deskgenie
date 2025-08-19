import { drizzle } from "drizzle-orm/node-postgres"
import env from "@/app/config/env"
import * as schemas from '@/app/db/schema'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: env.NEXT_DATABASE_URL!,
})

const db = drizzle(pool, {
  schema: {
    ...schemas
  }
})

await db.select();

export default db;