import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import path from 'node:path'

const schemaBodyReqeust = z.object({
  numberTable: z.string(),
  capacity: z.string(),
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createTable(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { numberTable, capacity } = schemaBodyReqeust.parse(request.body)

    const qrcodeUrl = `http://localhost:5173/qrcode/${numberTable}`

    const qrcodeFileName = `qrcode-${numberTable}.png`

    const qrcodePath = path.resolve(
      __dirname,
      '../../../../uploads/qrcodes',
      qrcodeFileName
    )

    await QRCode.toFile(qrcodePath, qrcodeUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
    })

    const table = await prisma.table.create({
      data: {
        numberTable,
        capacity,
        qrcodePath: qrcodeFileName,
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
