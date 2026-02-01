import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaRequestQuery = z.object({
  pageIndex: z.string().optional(),
});

export async function getordersPending(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { pageIndex } = schemaRequestQuery.parse(request.query);

    const ordersPending = await prisma.orders.findMany({
      where: {
        status: "PENDING",
      },

      orderBy: {
        createdAt: "asc",
      },

      take: 12,
      skip: Number(pageIndex) * 12,

      include: {
        table: {
          select: {
            numberTable: true,
          },
        },
        ordersItems: {
          select: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
            quantity: true,
          },
        },
      },
    });

    const totalCount = await prisma.orders.count({
      where: {
        status: "PENDING",
      },
    });
    const totalPages = Math.ceil(totalCount / 12);

    return reply.status(200).send({
      ordersPending,
      metas: {
        pageIndex,
        perPage: 12,
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
