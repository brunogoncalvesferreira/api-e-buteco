import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaRequestQuery = z.object({
  pageIndex: z.string().optional(),
  name: z.string().optional(),
});

export async function getProducts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { pageIndex, name } = schemaRequestQuery.parse(request.query);

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },

        deleted: "FALSE",
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 10,
      skip: Number(pageIndex) * 10,
    });

    const totalCount = await prisma.product.count();
    const totalPages = Math.ceil(totalCount / 10);

    return reply.status(200).send({
      products,
      metas: {
        pageIndex,
        perPage: 10,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
