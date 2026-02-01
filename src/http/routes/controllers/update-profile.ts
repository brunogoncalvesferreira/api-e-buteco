import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { prisma } from "../../../lib/prisma.ts";
import { compare, hash } from "bcryptjs";

const schemaBodyRequest = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  passwordOld: z.string().min(6).optional(),
});

const schemaBodyRequestParams = z.object({
  userId: z.string(),
});

export async function updateProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = schemaBodyRequestParams.parse(request.params);

    const { name, email, password, passwordOld } = schemaBodyRequest.parse(
      request.body,
    );

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado." });
    }

    if (password && !passwordOld) {
      return reply.status(400).send({
        message: "Digite sua senha antiga, para alterar sua senha!",
      });
    }

    if (password && passwordOld) {
      const checkPasswordOld = await compare(passwordOld, user.password);

      if (!checkPasswordOld) {
        return reply.status(400).send({
          message: "Senha antiga incorreta!",
        });
      }

      user.password = await hash(password, 6);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        password: user.password,
      },
    });

    return reply.status(200).send({
      message: "Perfil atualizado com sucesso!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
