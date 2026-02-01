import { FastifyReply, FastifyRequest } from "fastify";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";

const schemaBodyReqeust = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email, password } = schemaBodyReqeust.parse(request.body);

    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      return reply.status(409).send({
        message: "E-mail já em uso, por favor escolha outro!",
      });
    }

    const passwordHash = await hash(password, 6);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    return reply.status(201).send(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: error.issues,
      });
    }
  }
}
