import { FastifyInstance } from 'fastify'

import { createUser } from './controllers/create-user.ts'
import { authenticate } from './controllers/authenticate.ts'
import { createCategories } from './controllers/create-categories.ts'
import { createProducts } from './controllers/create-products.ts'
import { createTable } from './controllers/create-table.ts'
import { createOrders } from './controllers/create-orders.ts'
import { getProducts } from './controllers/get-products.ts'
import { getProfile } from './controllers/get-profile.ts'
import { ensureAuthenticate } from '../../middleware/ensure-authenticate.ts'
import { getTables } from './controllers/get-tables.ts'
import { getordersPending } from './controllers/get-orders-pending.ts'
import { getOrdersReady } from './controllers/get-orders-ready.ts'
import { getOrdersDelivered } from './controllers/get-orders-delivered.ts'
import { getOrdersCancelled } from './controllers/get-orders-cancelled.ts'
import { orderStatusReady } from './controllers/order-status-ready.ts'
import { orderStatusDelivered } from './controllers/order-status-delivered.ts'
import { orderStatusCancelled } from './controllers/order-status-cancelled.ts'
import { getProductsByCategories } from './controllers/get-products-by-categories.ts'

export async function appRoutes(app: FastifyInstance) {
  // authenticate
  app.post('/authenticate', authenticate)

  // users
  app.post('/user', createUser)
  app.get('/profile', { onRequest: [ensureAuthenticate] }, getProfile)

  // categories
  app.post('/categories', createCategories)
  app.get('/categories/products', getProductsByCategories)

  // products
  app.post('/products/:categoriesId', createProducts)
  app.get('/products', getProducts)

  // tables
  app.post('/tables', createTable)
  app.get('/tables', getTables)

  // orders
  app.post('/order/:tableId', createOrders)
  app.get('/orders/pending', getordersPending)
  app.get('/orders/ready', getOrdersReady)
  app.get('/orders/delivered', getOrdersDelivered)
  app.get('/orders/cancelled', getOrdersCancelled)
  app.patch('/order/ready/:orderId', orderStatusReady)
  app.patch('/order/delivered/:orderId', orderStatusDelivered)
  app.patch('/order/cancelled/:orderId', orderStatusCancelled)
}
