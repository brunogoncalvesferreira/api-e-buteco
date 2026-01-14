import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

import QRCode from 'qrcode'
import path from 'node:path'

const schemaBodyRequest = z.object({
  numberTable: z.string(),
  capacity: z.string(),
})

export async function createTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { numberTable, capacity } = schemaBodyRequest.parse(request.body)

    const qrcodeUrl = `http://localhost:5173/mesa/${numberTable}`

    const qrcodeFileName = `qrcode-${numberTable}.png`

    const qrcodePath = path.resolve(
      process.cwd(),
      'uploads', 'qrcodes',
      qrcodeFileName
    )

    const qrcodePathSave = `qrcodes/${qrcodeFileName}`

    await QRCode.toFile(qrcodePath, qrcodeUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
    })

    const table = await prisma.table.create({
      data: {
        numberTable,
        capacity,
        qrcodePath: qrcodePathSave,
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
