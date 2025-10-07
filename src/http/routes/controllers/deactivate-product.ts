import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../../lib/prisma.ts'
import z from 'zod'

const schemaBodyRequestParams = z.object({
  productId: z.string(),
})

export async function deactivateProduct(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { productId } = schemaBodyRequestParams.parse(request.params)

    await prisma.product.update({
      where: {
        id: productId,
      },

      data: {
        active: 'FALSE',
      },
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
