import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyReqeust = z.object({
  numberTable: z.string(),
  capacity: z.string(),
  qrcodePath: z.string().optional(),
})

export async function createTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { numberTable, capacity, qrcodePath } = schemaBodyReqeust.parse(
      request.body
    )

    const table = await prisma.table.create({
      data: {
        numberTable,
        capacity,
        qrcodePath,
      },
    })

    return reply.status(201).send(table)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
