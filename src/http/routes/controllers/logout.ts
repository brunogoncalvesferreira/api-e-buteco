import { FastifyReply, FastifyRequest } from "fastify";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("token", {
    path: "/",
  });

  return reply.status(200).send();
}
