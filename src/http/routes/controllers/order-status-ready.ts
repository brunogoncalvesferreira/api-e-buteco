import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaBodyRequestParams = z.object({
  orderId: z.string(),
});

export async function orderStatusReady(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { orderId } = schemaBodyRequestParams.parse(request.params);

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        status: "READY",
      },
    });

    return reply.status(200).send({
      message: "Pedido pronto com sucesso!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
