import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../../lib/prisma.ts'
import z from 'zod'

export async function getProductsByCategories(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const categories = await prisma.categories.findMany({
      include: {
        products: true,
      },
    })

    return reply.status(200).send({
      categories,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
