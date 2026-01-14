import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { createPixOrder, createCardOrder, CreateCardOrderRequest } from '../../../services/pag-seguro.ts'
import { prisma } from '../../../lib/prisma.ts'

interface CreatePixOrderRequest {
  reference_id?: string
  name: string
  quantity: number
  unit_amount: number
}

const createCardOrderSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    tax_id: z.string(),
    phones: z.array(z.object({
      country: z.string(),
      area: z.string(),
      number: z.string(),
      type: z.enum(['MOBILE', 'MAIN']),
    })),
  }),
  card: z.object({
    number: z.string(),
    exp_month: z.string(),
    exp_year: z.string(),
    security_code: z.string(),
    holder: z.object({
      name: z.string(),
    }),
  }),
  installments: z.number().min(1).max(12),
})

export async function createOrderPix(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { reference_id, name, quantity, unit_amount } =
      request.body as CreatePixOrderRequest

    const pixResponse = await createPixOrder({
      reference_id,
      name,
      quantity,
      unit_amount,
    })

    // Atualizar o pedido com o ID do pagamento PIX
    if (reference_id) {
      await prisma.orders.update({
        where: { id: reference_id },
        data: {
          paymentId: pixResponse.id,
        },
      })
    }

    return reply.status(201).send({
      message: 'Pedido PIX criado com sucesso',
      data: pixResponse,
    })
  } catch (error) {
    console.error('Erro ao criar pedido PIX:', error)
    return reply.status(500).send({
      message: 'Erro interno do servidor',
    })
  }
}

export async function createOrderCard(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { orderId, customer, card, installments } = createCardOrderSchema.parse(
      request.body
    )

    // Buscar o pedido no banco de dados
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        ordersItems: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return reply.status(404).send({
        message: 'Pedido não encontrado',
      })
    }

    if (order.wasPaid === 'TRUE') {
      return reply.status(400).send({
        message: 'Pedido já foi pago',
      })
    }

    // Criar o pedido no PagSeguro
    const cardResponse = await createCardOrder({
      reference_id: orderId,
      name: `Pedido #${order.numberOrder}`,
      quantity: 1,
      unit_amount: order.amount,
      customer,
      card,
      installments,
    })

    // Atualizar o pedido com o ID do pagamento
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        paymentId: cardResponse.id,
      },
    })

    return reply.status(201).send({
      message: 'Pagamento via cartão processado com sucesso',
      data: cardResponse,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: error.issues,
      })
    }

    console.error('Erro ao processar pagamento via cartão:', error)
    return reply.status(500).send({
      message: 'Erro interno do servidor',
    })
  }
}
