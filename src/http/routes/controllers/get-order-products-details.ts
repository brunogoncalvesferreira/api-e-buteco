import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyRequestParams = z.object({
  orderId: z.string(),
})

export async function getOrderProductsDetails(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { orderId } = schemaBodyRequestParams.parse(request.params)

    const orderProductDetails = await prisma.orders.findFirst({
      where: {
        id: orderId,
      },

      include: {
        ordersItems: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        table: {
          select: {
            numberTable: true,
          },
        },
      },
    })

    return reply.status(200).send(orderProductDetails)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
