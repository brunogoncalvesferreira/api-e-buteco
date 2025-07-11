import { FastifyReply, FastifyRequest } from 'fastify'

export async function ensureAuthenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify()
  } catch (error) {
    throw new Error('TOKEN INVALID')
  }
}
