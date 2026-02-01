import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaBodyRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  imageUrl: z.string().optional(),
  active: z.enum(["TRUE", "FALSE"]).optional(),
});

const schemaBodyRequestParams = z.object({
  productId: z.string(),
});

export async function updateProduct(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { productId } = schemaBodyRequestParams.parse(request.params);

    const { name, description, price, imageUrl, active } =
      schemaBodyRequest.parse(request.body);

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
        price,
        imageUrl,
        active,
      },
    });

    return reply.status(200).send({
      message: "Produto atualizado com sucesso!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
