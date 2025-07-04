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
    const parts = request.files() // Multipart stream
    const pump = util.promisify(pipeline) // Convert stream to promise

    // Iterate over the stream
    for await (const chunk of parts) {
      if (chunk.file) {
        const multipart = chunk as Multipart // Convert chunk to Multipart
        const file = multipart.fields as MultipartFields // Convert fields to MultipartFields

        const filename = `${Date.now()}-${chunk.filename}` // Generate filename

        // Upload file
        const uploadPath = path.resolve(
          __dirname,
          '../../../../uploads/products',
          filename
        )

        await pump(chunk.file, fs.createWriteStream(uploadPath)) // Convert stream to promise

        // Create product
        const product = await prisma.product.create({
          data: {
            name: String((file.name as MultipartValue).value), // Convert value to string
            description: String((file.description as MultipartValue).value),
            price: Number((file.price as MultipartValue).value),
            categoriesId: String((file.categoriesId as MultipartValue).value),
            imageUrl: filename,
          },
        })

        reply.status(201).send({ product }) // Send product
      } else {
        reply.status(400).send({ message: 'File not found' }) // Send error
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
