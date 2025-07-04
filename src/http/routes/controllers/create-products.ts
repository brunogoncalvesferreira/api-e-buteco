import { FastifyReply, FastifyRequest } from 'fastify'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma.ts'

const schemaBodyReqeust = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  imageUrl: z.string().url().optional(),
})

const schemaBodyReqeustParams = z.object({
  categoriesId: z.string(),
})

export async function createProducts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { name, description, price, imageUrl } = schemaBodyReqeust.parse(
      request.body
    )

    const { categoriesId } = schemaBodyReqeustParams.parse(request.params)

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        categoriesId,
      },
    })

    return reply.status(201).send(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      })
    }
  }
}
