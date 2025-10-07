import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyRequest = z.object({
  numberTable: z.string(),
})

export async function recentOrderTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { numberTable } = schemaBodyRequest.parse(request.params)

    const table = await prisma.table.findFirst({
      where: {
        numberTable,
      },
    })

    const order = await prisma.orders.findFirst({
      where: {
        tableId: table?.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return reply.status(200).send(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
