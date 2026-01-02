import fastify from 'fastify'

import { fastifyCookie } from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { fastifyCors } from '@fastify/cors'

import { fastifyMultipart } from '@fastify/multipart'
import { fastifyStatic } from '@fastify/static'

import { appRoutes } from './routes/app-routes.ts'
import { env } from '../env/index.ts'

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
/* import { actionToUpdateTableStatusHourly } from '../jobs/action-to-update-table-status-hourly.ts' */

export const app = fastify()

app.register(fastifyCors, {
  origin: ['http://localhost:5173', 'https://ebuteco.vercel.app', 'https://ebuteco.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
})

const uploadsPath = join(process.cwd(), 'uploads')

app.register(fastifyMultipart, {
  prefix: 'files',
})

app.register(fastifyStatic, {
  root: uploadsPath,
  prefix: '/files/',
  decorateReply: true,
})

app.register(appRoutes)

app.register(fastifyCookie)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },

  sign: {
    expiresIn: '7d',
  },
})

/* actionToUpdateTableStatusHourly() */
