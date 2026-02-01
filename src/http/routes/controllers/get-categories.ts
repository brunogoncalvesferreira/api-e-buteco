import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

export async function getCategories(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const categories = await prisma.categories.findMany();

    return reply.status(200).send(categories);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
