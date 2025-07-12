import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyReqeust = z.object({
  numberTable: z.string().optional(),
})

export async function getTableByNumberTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { numberTable } = schemaBodyReqeust.parse(request.params)

    const table = await prisma.table.findFirst({
      where: {
        numberTable,
      },

      select: {
        id: true,
      },
    })

    if (!table) {
      return reply.status(404).send({
        message: 'Mesa não encontrada',
      })
    }

    return reply.status(200).send(table)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
