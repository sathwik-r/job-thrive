import { env } from './config/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";

const { Pool: PgPool } = pg;

// Database URL is validated in env.ts
const isNeonConnection = env.DATABASE_URL.includes('neon.tech') || 
                        env.DATABASE_URL.includes('neon.database');

export const db = isNeonConnection 
  ? (() => {
      neonConfig.webSocketConstructor = ws;
      const pool = new NeonPool({ connectionString: env.DATABASE_URL });
      return drizzleNeon({ client: pool, schema });
    })()
  : (() => {
      const isRdsHost = /rds\.amazonaws\.com/.test(env.DATABASE_URL);
      const sslModeEnv = (process.env.PGSSLMODE || process.env.SSLMODE || "").toLowerCase();
      const sslRequired = isRdsHost || sslModeEnv === "require" || sslModeEnv === "verify-full" || /sslmode=require/.test(env.DATABASE_URL);

      // Parse connection string to get individual components
      const url = new URL(env.DATABASE_URL);
      const pool = new PgPool({
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        database: url.pathname.slice(1),  // remove leading '/'
        user: url.username,
        password: url.password,
        ssl: sslRequired ? { rejectUnauthorized: false } : false
      });
      return drizzle({ client: pool, schema });
    })();
