import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../../../lib/prisma.ts'
import { compare } from 'bcryptjs'

const schemaBodyReqeust = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { email, password } = schemaBodyReqeust.parse(request.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return reply.status(404).send({
        message: 'E-mail ou senha incorretos!',
      })
    }

    const passwordCompare = await compare(password, user.password)

    if (!passwordCompare) {
      return reply.status(404).send({
        message: 'E-mail ou senha incorretos!',
      })
    }

    const token = await reply.jwtSign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      }
    )

    reply.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      path: '/',
    })

    return reply.status(200).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
