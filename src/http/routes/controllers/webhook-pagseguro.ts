import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma.ts";
import { getOrderStatus } from "../../../services/pag-seguro.ts";

const webhookSchema = z.object({
  id: z.string(),
  reference_id: z.string(),
  status: z.enum(["PAID", "CANCELLED", "IN_ANALYSIS", "DECLINED"]),
  charges: z.array(
    z.object({
      id: z.string(),
      status: z.enum(["PAID", "CANCELLED", "IN_ANALYSIS", "DECLINED"]),
      amount: z.object({
        value: z.number(),
        currency: z.string(),
      }),
      payment_method: z.object({
        type: z.string(),
      }),
    }),
  ),
});

export async function handlePagSeguroWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const webhookData = webhookSchema.parse(request.body);

    console.log("Webhook PagSeguro recebido:", webhookData);

    // Buscar o pedido pelo reference_id
    const order = await prisma.orders.findUnique({
      where: { id: webhookData.reference_id },
      include: {
        table: true,
      },
    });

    if (!order) {
      console.error(
        "Pedido não encontrado para o webhook:",
        webhookData.reference_id,
      );
      return reply.status(404).send({ message: "Pedido não encontrado" });
    }

    // Verificar se o pagamento foi aprovado
    const isPaid =
      webhookData.status === "PAID" ||
      webhookData.charges.some((charge) => charge.status === "PAID");

    if (isPaid) {
      // Atualizar o pedido como pago e mudar status para PREPARATION se estiver PENDING
      const updateData: any = {
        wasPaid: "TRUE",
        paymentId: webhookData.id,
      };

      if (order.status === "PENDING") {
        updateData.status = "PREPARATION";
      }

      await prisma.orders.update({
        where: { id: order.id },
        data: updateData,
      });

      // Registrar o pagamento na tabela de pagamentos
      const charge = webhookData.charges.find((c) => c.status === "PAID");
      if (charge) {
        await prisma.payments.create({
          data: {
            provider: "PAGSEGURO",
            providerId: charge.id,
            reference: webhookData.reference_id,
            amount: charge.amount.value,
            currency: charge.amount.currency,
            method: charge.payment_method.type,
            status: "PAID",
            metadata: {
              webhookData,
              orderId: order.id,
            },
          },
        });
      }

      console.log(
        `Pedido ${order.id} marcado como pago e em preparação via webhook`,
      );
    } else if (
      webhookData.status === "CANCELLED" ||
      webhookData.charges.some((charge) => charge.status === "CANCELLED")
    ) {
      // Atualizar o pedido como cancelado
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
        },
      });

      // Liberar a mesa se o pedido foi cancelado
      if (order.table) {
        await prisma.table.update({
          where: { id: order.table.id },
          data: {
            tableStatus: "FREE",
            upadetedAt: new Date(),
          },
        });
      }

      console.log(`Pedido ${order.id} cancelado via webhook`);
    }

    return reply
      .status(200)
      .send({ message: "Webhook processado com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Erro de validação no webhook:", error.issues);
      return reply.status(400).send({
        message: "Dados do webhook inválidos",
        errors: error.issues,
      });
    }

    console.error("Erro ao processar webhook PagSeguro:", error);
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}

// Função para verificar manualmente o status de um pedido
export async function checkPaymentStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { orderId } = request.params as { orderId: string };

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.paymentId) {
      return reply.status(404).send({
        message: "Pedido ou ID de pagamento não encontrado",
      });
    }

    // Buscar o status atual no PagSeguro
    const paymentStatus = await getOrderStatus(order.paymentId);

    // Atualizar o status local se necessário
    const isPaid =
      paymentStatus.status === "PAID" ||
      paymentStatus.charges?.some((charge: any) => charge.status === "PAID");

    let currentWasPaid = order.wasPaid;
    let currentStatus = order.status;

    if (isPaid && order.wasPaid === "FALSE") {
      const updateData: any = {
        wasPaid: "TRUE",
      };

      if (order.status === "PENDING") {
        updateData.status = "PREPARATION";
        currentStatus = "PREPARATION";
      }

      await prisma.orders.update({
        where: { id: orderId },
        data: updateData,
      });

      currentWasPaid = "TRUE";
    }

    return reply.status(200).send({
      orderId,
      paymentStatus,
      localStatus: {
        wasPaid: currentWasPaid,
        status: currentStatus,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
