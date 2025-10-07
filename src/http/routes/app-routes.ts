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
import { updateProduct } from './controllers/update-product.ts'
import { updateProfile } from './controllers/update-profile.ts'
import { logout } from './controllers/logout.ts'
import { getCategories } from './controllers/get-categories.ts'
import { getQrcodeUrl } from './controllers/get-qrcode-url.ts'
import { getTableByNumberTable } from './controllers/get-table-by-number-table.ts'
import { getOrderProductsDetails } from './controllers/get-order-products-details.ts'
import { getAllOrders } from './controllers/get-all-orders.ts'
import { deactivateProduct } from './controllers/deactivate-product.ts'
import { activeProduct } from './controllers/active-product.ts'
import { deleteProduct } from './controllers/delete-product.ts'
import { recentOrderTable } from './controllers/recent-order-table.ts'
import { createOrderPix } from './controllers/payment.ts'

export async function appRoutes(app: FastifyInstance) {
  // authenticate
  app.post('/authenticate', authenticate)
  app.post('/logout', logout)

  // users
  app.post('/user', createUser)
  app.get('/profile', { onRequest: [ensureAuthenticate] }, getProfile)
  app.put(
    '/profile/:userId',
    { onRequest: [ensureAuthenticate] },
    updateProfile
  )

  // categories
  app.post('/categories', createCategories)
  app.get('/categories', getCategories)
  app.get('/categories/products', getProductsByCategories)

  // products
  app.post('/products', createProducts)
  app.get('/products', getProducts)
  app.put('/product/:productId', updateProduct)
  app.patch('/product/deactivate/:productId', deactivateProduct)
  app.patch('/product/active/:productId', activeProduct)
  app.patch('/product/delete/:productId', deleteProduct)

  // tables
  app.post('/tables', createTable)
  app.get('/tables', getTables)
  app.get('/table/:numberTable', getTableByNumberTable)
  app.get('/tables/qrcode/:tableId', getQrcodeUrl)

  // orders
  app.get('/orders', getAllOrders)
  app.post('/order/:tableId', createOrders)
  app.get('/orders/pending', getordersPending)
  app.get('/orders/ready', getOrdersReady)
  app.get('/orders/delivered', getOrdersDelivered)
  app.get('/orders/cancelled', getOrdersCancelled)
  app.patch('/order/ready/:orderId', orderStatusReady)
  app.patch('/order/delivered/:orderId', orderStatusDelivered)
  app.patch('/order/cancelled/:orderId', orderStatusCancelled)
  app.get('/order/product-details/:orderId', getOrderProductsDetails)
  app.get('/order/table/:numberTable', recentOrderTable)

  // payment
  app.post('/pay/pix', createOrderPix)
}
