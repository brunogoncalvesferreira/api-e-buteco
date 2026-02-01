import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaRequestQuery = z.object({
  pageIndex: z.string().optional(),
  numberTable: z.string().optional(),
});

export async function getTables(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { pageIndex, numberTable } = schemaRequestQuery.parse(request.query);

    const tables = await prisma.table.findMany({
      where: {
        numberTable: {
          contains: numberTable,
          mode: "insensitive",
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      take: 10,
      skip: Number(pageIndex) * 10,
    });

    const totalCount = await prisma.table.count();
    const totalPages = Math.ceil(totalCount / 10);

    return reply.status(200).send({
      tables,
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
