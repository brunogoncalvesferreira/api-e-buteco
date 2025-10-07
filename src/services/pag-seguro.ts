import axios from 'axios'

import { env } from '../env/index.ts'

export interface CreatePixOrderRequest {
  reference_id?: string
  name: string
  quantity: number
  unit_amount: number
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
        'https://sandbox.api.pagseguro.com/orders',
        {
          reference_id: 'ex-00001',

          customer: {
            name: 'Jose da Silva',
            email: 'email@test.com',
            tax_id: '12345678909',
            phones: [
              {
                country: '55',
                area: '11',
                number: '999999999',
                type: 'MOBILE',
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

          qr_codes: [{ amount: { value: unit_amount, currency: 'BRL' } }],

          notification_urls: ['https://meusite.com/notificacoes'],
        },
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${env.PAGBANK_TESTE}`,
            'content-type': 'application/json',
          },
        }
      )
      .then((response) => {
        console.log(response.data)
        return response.data
      })
  } catch (error) {
    if (error) {
      console.log(error)
    }
  }
}
