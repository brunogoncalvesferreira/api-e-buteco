import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../../lib/prisma.ts";
import { getIO } from "../../../lib/socket.ts";

const schemaBodyRequestParams = z.object({
  orderId: z.string(),
});

export async function orderStatusPreparation(
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
        status: "PREPARATION",
      },
    });

    // Emit Socket.io event
    const io = getIO();
    io.emit("orders:status-change", { orderId, status: "PREPARATION" });

    return reply.status(200).send({
      message: "Pedido em preparo com sucesso!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
