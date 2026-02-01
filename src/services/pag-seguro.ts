import axios from "axios";

import { env } from "../env/index.ts";

export interface CreatePixOrderRequest {
  reference_id?: string;
  name: string;
  quantity: number;
  unit_amount: number;
}

export interface CreateCardOrderRequest {
  reference_id?: string;
  name: string;
  quantity: number;
  unit_amount: number;
  customer: {
    name: string;
    email: string;
    tax_id: string;
    phones: Array<{
      country: string;
      area: string;
      number: string;
      type: "MOBILE" | "MAIN";
    }>;
  };
  card: {
    number: string;
    exp_month: string;
    exp_year: string;
    security_code: string;
    holder: {
      name: string;
    };
  };
  installments: number;
}

export async function createPixOrder({
  reference_id,
  name,
  quantity,
  unit_amount,
}: CreatePixOrderRequest) {
  try {
    const response = await axios
      .post(
        "https://sandbox.api.pagseguro.com/orders",
        {
          reference_id: reference_id || `pix-${Date.now()}`,
          customer: {
            name: "Cliente E-Buteco",
            email: "cliente@ebuteco.com",
            tax_id: "12345678909",
            phones: [
              {
                country: "55",
                area: "11",
                number: "999999999",
                type: "MOBILE",
              },
            ],
          },
          items: [
            {
              reference_id,
              name,
              quantity,
              unit_amount,
            },
          ],
          qr_codes: [{ amount: { value: unit_amount, currency: "BRL" } }],
          ...(env.APP_URL.includes("localhost")
            ? {}
            : { notification_urls: [`${env.APP_URL}/webhook/pagseguro`] }),
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${env.PAGBANK_TESTE}`,
            "content-type": "application/json",
          },
        },
      )
      .then((response) => {
        console.log("PIX Order created:", response.data);
        return response.data;
      });

    return response;
  } catch (error) {
    console.error("Erro ao criar pedido PIX:", error);
    throw error;
  }
}

export async function createCardOrder({
  reference_id,
  name,
  quantity,
  unit_amount,
  customer,
  card,
  installments,
}: CreateCardOrderRequest) {
  try {
    const payload = {
      reference_id: reference_id || `card-${Date.now()}`,
      customer,
      items: [
        {
          reference_id,
          name,
          quantity,
          unit_amount,
        },
      ],
      charges: [
        {
          reference_id: `charge-${Date.now()}`,
          description: `Pagamento - ${name}`,
          amount: {
            value: unit_amount,
            currency: "BRL",
          },
          payment_method: {
            type: "CREDIT_CARD",
            installments,
            capture: true,
            card: {
              number: card.number,
              security_code: card.security_code,
              holder: card.holder,
              exp_month: card.exp_month,
              exp_year: card.exp_year,
            },
          },
        },
      ],
      ...(env.APP_URL.includes("localhost")
        ? {}
        : { notification_urls: [`${env.APP_URL}/webhook/pagseguro`] }),
    };

    console.log(
      "Payload enviado para PagSeguro:",
      JSON.stringify(payload, null, 2),
    );

    const response = await axios
      .post("https://sandbox.api.pagseguro.com/orders", payload, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${env.PAGBANK_TESTE}`,
          "content-type": "application/json",
        },
      })
      .then((response) => {
        console.log("Card Order created:", response.data);
        return response.data;
      });

    return response;
  } catch (error) {
    console.error("Erro ao criar pedido via cartão:", error);

    // Log detalhado do erro do PagSeguro
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: any; status?: any } };
      console.error("Resposta do PagSeguro:", err.response?.data);
      console.error("Status:", err.response?.status);
    }
    throw error;
  }
}

export async function getOrderStatus(orderId: string) {
  try {
    const response = await axios.get(
      `https://sandbox.api.pagseguro.com/orders/${orderId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${env.PAGBANK_TESTE}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar status do pedido:", error);
    throw error;
  }
}
