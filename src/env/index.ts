import "dotenv/config";

import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SECRET: z.string(),
  APP_URL: z.string().url(),
  PAGBANK_API_URL: z.string().url(),
  PAGBANK_TESTE: z.string(),
  PAGBANK_PRODUCTION: z.string(),
  PAGBANK_SANDBOX: z.coerce.boolean().default(true), // true or false
  PAGBANK_NOTIFICATION_URL: z.string().url(),
  PAGBANK_REDIRECT_URL: z.string().url(),
  PAGBANK_NOTIFICATION_ID: z.string().optional(),
});

const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  APP_URL: process.env.APP_URL,
  PAGBANK_API_URL: process.env.PAGBANK_API_URL,
  PAGBANK_TESTE: process.env.PAGBANK_TESTE,
  PAGBANK_PRODUCTION: process.env.PAGBANK_PRODUCTION,
  PAGBANK_SANDBOX: process.env.PAGBANK_SANDBOX,
  PAGBANK_NOTIFICATION_URL: process.env.PAGBANK_NOTIFICATION_URL,
  PAGBANK_REDIRECT_URL: process.env.PAGBANK_REDIRECT_URL,
  PAGBANK_NOTIFICATION_ID: process.env.PAGBANK_NOTIFICATION_ID,
});

export { env };
