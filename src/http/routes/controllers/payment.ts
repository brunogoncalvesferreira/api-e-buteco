import { FastifyReply, FastifyRequest } from 'fastify'
import { createPixOrder } from '../../../services/pag-seguro.ts'

interface CreatePixOrderRequest {
  reference_id?: string
  name: string
  quantity: number
  unit_amount: number
}

export async function createOrderPix(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { reference_id, name, quantity, unit_amount } =
      request.body as CreatePixOrderRequest

    await createPixOrder({
      reference_id,
      name,
      quantity,
      unit_amount,
    })

    return reply.status(201).send({
      message: 'Pedido criado com sucesso',
    })
  } catch (error) {
    if (error) {
      console.log(error)
    }
  }
}
