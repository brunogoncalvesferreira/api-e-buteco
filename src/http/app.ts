import fastify from 'fastify'

import { fastifyCookie } from '@fastify/cookie'
import { fastifyJwt } from '@fastify/jwt'

import { appRoutes } from './routes/app-routes.ts'
import { env } from '../env/index.ts'

export const app = fastify()

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
