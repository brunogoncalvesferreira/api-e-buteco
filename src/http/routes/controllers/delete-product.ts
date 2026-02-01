import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaBodyRequestParams = z.object({
  productId: z.string(),
});

export async function deleteProduct(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { productId } = schemaBodyRequestParams.parse(request.params);

    await prisma.product.update({
      where: {
        id: productId,
      },

      data: {
        deleted: "TRUE",
      },
    });

    return reply.status(200).send({
      message: "Produto deletado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
