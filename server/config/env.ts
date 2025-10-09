import { config } from "dotenv";
import { z } from "zod";

// Load environment variables
config();

// Define environment schema with Zod
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string(),
  
  // AWS Configuration
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  
  // Cognito Configuration
  COGNITO_USER_POOL_ID: z.string().default('ap-south-1_UUoEustM6'),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  
  // Razorpay Configuration
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),

  // AWS SES Configuration
  SES_FROM_EMAIL: z.string().default('noreply@jobthrive.com'),
  
  // Cal.com Configuration
  CALCOM_API_KEY: z.string(),
  CALCOM_API_URL: z.string().default('https://api.cal.com/v1'),
  CALCOM_WEBHOOK_SECRET: z.string().optional(),
});


// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

// Export validated environment variables
export const env = parsed.data;