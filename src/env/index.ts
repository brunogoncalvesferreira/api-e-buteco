import { config } from 'dotenv'
import { z } from 'zod'

config()

export const schemaEnv = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  JWT_SECRET: z.string(),
})

export const env = schemaEnv.parse(process.env)
