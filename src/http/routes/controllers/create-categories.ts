import { FastifyReply, FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaBodyReqeust = z.object({
  name: z.string(),
});

export async function createCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { name } = schemaBodyReqeust.parse(request.body);

    const categories = await prisma.categories.create({
      data: {
        name,
      },
    });

    return reply.status(201).send(categories);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
