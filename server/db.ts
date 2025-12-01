import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

// Configure WebSocket for Neon serverless - required for non-browser environments
neonConfig.webSocketConstructor = ws;

// Detect if we're connecting to Neon or standard PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL?.includes('neon.tech') || 
                       process.env.DATABASE_URL?.includes('neon.') ||
                       process.env.PGHOST?.includes('neon');

// For non-Neon databases, we need to disable WebSocket pooling
if (!isNeonDatabase) {
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export async function ensureTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        title VARCHAR NOT NULL,
        description TEXT,
        colors JSONB,
        theme_image TEXT,
        moodboard_images JSONB,
        decor_items JSONB,
        total_cost_range VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_favorites_user_id" ON favorites (user_id)
    `);
    
    console.log("[db] Database tables verified");
  } catch (error) {
    console.error("[db] Error ensuring tables exist:", error);
  }
}
