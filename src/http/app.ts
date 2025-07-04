import fastify from 'fastify'

import { fastifyCookie } from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'
import { fastifyCors } from '@fastify/cors'

import { fastifyMultipart } from '@fastify/multipart'
import { fastifyStatic } from '@fastify/static'

import { appRoutes } from './routes/app-routes.ts'
import { env } from '../env/index.ts'
import { join } from 'node:path'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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
    cookieName: 'cookie',
    signed: false,
  },

  sign: {
    expiresIn: '7d',
  },
})
