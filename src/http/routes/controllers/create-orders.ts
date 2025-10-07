import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyReqeust = z.object({
  payment: z.enum(['PIX', 'CARD']).optional(),
  observations: z.string().optional(),
  products: z
    .object({
      productId: z.string(),
      quantity: z.number(),
    })
    .array(),
})

const schemaBodyReqeustParams = z.object({
  tableId: z.string(),
})

export async function createOrders(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { products, observations, payment } = schemaBodyReqeust.parse(
      request.body
    )

    const { tableId } = schemaBodyReqeustParams.parse(request.params)


    const productIds = products.map((product) => product.productId)

    const productExist = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    const orderProducts = products.map((product) => {
      const productDetails = productExist.find(
        (productExist) => productExist.id === product.productId
      )
      return {
        productId: productDetails?.id,
        quantity: product.quantity,
        priceUnitProduct: productDetails?.price ?? 0,
      }
    })

    const amount = orderProducts.reduce((acc, product) => {
      return acc + product.priceUnitProduct * product.quantity
    }, 0)

    const order = await prisma.orders.create({
      data: {
        amount,
        observations,
        payment,
        tableId,
        status: 'PENDING',
        wasPaid: 'FALSE',
        ordersItems: {
          create: orderProducts,
        },
      },

      include: {
        ordersItems: {
          include: {
            product: {
              select: {
                name: true,
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

    await prisma.table.update({
      where: { id: tableId },
      data: {
        tableStatus: 'BUSY',
        upadetedAt: new Date(),
      },
    })

    return reply.status(201).send(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
