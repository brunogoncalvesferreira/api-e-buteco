import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyRequestParams = z.object({
  tableId: z.string(),
})

export async function getQrcodeUrl(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { tableId } = schemaBodyRequestParams.parse(request.params)

    const qrcode = await prisma.table.findFirst({
      where: {
        id: tableId,
      },

      select: {
        qrcodePath: true,
      },
    })

    return reply.status(200).send(qrcode)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
