import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaRequestQuery = z.object({
  pageIndex: z.string().optional(),
})

export async function getAllOrders(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { pageIndex } = schemaRequestQuery.parse(request.query)

    const ordersAll = await prisma.orders.findMany({
      orderBy: {
        createdAt: 'asc',
      },

      take: 8,
      skip: Number(pageIndex) * 8,

      include: {
        table: {
          select: {
            numberTable: true,
          },
        },

        ordersItems: {
          select: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
            quantity: true,
          },
        },
      },
    })

    const totalCount = await prisma.orders.count()
    const totalPages = Math.ceil(totalCount / 8)

    return reply.status(200).send({
      ordersAll,
      metas: {
        pageIndex,
        perPage: 8,
        totalCount,
        totalPages,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
