const { authenticate, requireRole } = require('../middleware/auth')

async function orderRoutes(fastify) {
  /**
   * GET /api/orders
   * Query: { sessionId?, status? }
   * Requires auth
   */
  fastify.get('/api/orders', {
    preHandler: authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const { tenantId } = request.user
    const { sessionId, status } = request.query

    const where = { tenantId }
    if (sessionId) where.sessionId = sessionId
    if (status) where.status = status

    const orders = await fastify.prisma.order.findMany({
      where,
      include: {
        items: true,
        session: {
          include: {
            table: { select: { number: true, label: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders
  })

  /**
   * POST /api/orders
   * Body: { sessionId, source, items: [{ menuItemId, quantity, note? }] }
   *
   * If source=CUSTOMER and tenant has orderApprovalRequired=true
   *   -> status = PENDING_APPROVAL
   * If source=KIOSK or orderApprovalRequired=false
   *   -> status = APPROVED
   *
   * This route does NOT require JWT (customer-web calls it).
   * It validates through sessionId instead.
   */
  fastify.post('/api/orders', {
    schema: {
      body: {
        type: 'object',
        required: ['sessionId', 'source', 'items'],
        properties: {
          sessionId: { type: 'string' },
          source: { type: 'string', enum: ['CUSTOMER', 'KIOSK'] },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['menuItemId', 'quantity'],
              properties: {
                menuItemId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                note: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { sessionId, source, items } = request.body

    // Validate session exists and is active
    const session = await fastify.prisma.tableSession.findFirst({
      where: { id: sessionId, status: 'ACTIVE' },
      include: {
        tenant: { select: { id: true, orderApprovalRequired: true } },
        table: { select: { number: true } },
      },
    })

    if (!session) {
      return reply.status(404).send({ error: 'Session not found or closed' })
    }

    const tenantId = session.tenantId

    // Resolve menu items to snapshot name + price
    const menuItemIds = items.map((i) => i.menuItemId)
    const menuItems = await fastify.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        tenantId,
        available: true,
      },
    })

    const menuMap = new Map(menuItems.map((m) => [m.id, m]))

    // Validate all items exist
    for (const item of items) {
      if (!menuMap.has(item.menuItemId)) {
        return reply.status(400).send({
          error: `Menu item ${item.menuItemId} not found or unavailable`,
        })
      }
    }

    // Determine initial status
    let status
    if (source === 'KIOSK') {
      status = 'APPROVED'
    } else if (session.tenant.orderApprovalRequired) {
      status = 'PENDING_APPROVAL'
    } else {
      status = 'APPROVED'
    }

    // Create order with items
    const order = await fastify.prisma.order.create({
      data: {
        sessionId,
        tenantId,
        source,
        status,
        items: {
          create: items.map((item) => {
            const menu = menuMap.get(item.menuItemId)
            return {
              menuItemId: item.menuItemId,
              name: menu.name,
              price: menu.price,
              quantity: item.quantity,
              note: item.note || null,
            }
          }),
        },
      },
      include: {
        items: true,
      },
    })

    // Broadcast
    fastify.broadcast(tenantId, {
      type: 'ORDER_CREATED',
      order: {
        ...order,
        tableNumber: session.table.number,
      },
    })

    // Also broadcast session update
    fastify.broadcast(tenantId, {
      type: 'SESSION_UPDATED',
      session: { id: sessionId, tableId: session.tableId },
    })

    return order
  })

  /**
   * PUT /api/orders/:id/approve
   */
  fastify.put('/api/orders/:id/approve', {
    preHandler: [authenticate, requireRole('ADMIN', 'CASHIER')],
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const order = await fastify.prisma.order.findFirst({
      where: { id, tenantId },
    })

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' })
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return reply.status(400).send({ error: `Cannot approve order with status ${order.status}` })
    }

    const updated = await fastify.prisma.order.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { items: true },
    })

    fastify.broadcast(tenantId, {
      type: 'ORDER_APPROVED',
      orderId: id,
    })

    return updated
  })

  /**
   * PUT /api/orders/:id/cancel
   */
  fastify.put('/api/orders/:id/cancel', {
    preHandler: [authenticate, requireRole('ADMIN', 'CASHIER')],
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const order = await fastify.prisma.order.findFirst({
      where: { id, tenantId },
    })

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' })
    }

    if (order.status === 'SERVED' || order.status === 'CANCELLED') {
      return reply.status(400).send({ error: `Cannot cancel order with status ${order.status}` })
    }

    const updated = await fastify.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    })

    fastify.broadcast(tenantId, {
      type: 'ORDER_CANCELLED',
      orderId: id,
    })

    return updated
  })
}

module.exports = orderRoutes
