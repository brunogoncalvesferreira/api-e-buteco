import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'
import { Multipart, MultipartFields, MultipartValue } from '@fastify/multipart'

import { fileURLToPath } from 'node:url'
import { pipeline } from 'node:stream'
import fs from 'node:fs'
import util from 'node:util'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function createProducts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const parts = request.files()
    const pump = util.promisify(pipeline)

    for await (const part of parts) {
      if (part.file) {
        const multipart = part as Multipart
        const file = multipart.fields as MultipartFields

        const filename = `${Date.now()}-${part.filename}`

        const uploadPath = path.resolve(
          __dirname,
          '../../../../uploads/products',
          filename
        )

        const imageUrl = `products/${filename}`

        await pump(part.file, fs.createWriteStream(uploadPath))

        const product = await prisma.product.create({
          data: {
            name: String((file.name as MultipartValue).value),
            description: String((file.description as MultipartValue).value),
            price: Number((file.price as MultipartValue).value),
            categoriesId: String((file.categoriesId as MultipartValue).value),
            imageUrl,
          },
        })

        reply.status(201).send({ product })
      } else {
        reply.status(400).send({ message: 'File not found' })
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
