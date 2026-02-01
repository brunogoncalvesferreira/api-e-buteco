import { FastifyReply, FastifyRequest } from "fastify";

import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaRequestUser = z.object({
  id: z.string(),
});

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = schemaRequestUser.parse(request.user);

    const user = await prisma.user.findFirst({
      where: { id },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return reply.status(200).send(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
