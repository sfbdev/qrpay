const { authenticate } = require('../middleware/auth')

async function sessionRoutes(fastify) {
  /**
   * GET /api/sessions/verify
   * Query: { tableId, pin }
   * Public route (customer-web uses this to verify PIN)
   */
  fastify.get('/api/sessions/verify', {
    schema: {
      querystring: {
        type: 'object',
        required: ['tableId', 'pin'],
        properties: {
          tableId: { type: 'string' },
          pin: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { tableId, pin } = request.query

    const session = await fastify.prisma.tableSession.findFirst({
      where: {
        tableId,
        pin,
        status: 'ACTIVE',
      },
      include: {
        table: {
          select: { number: true, label: true },
        },
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            brandColor: true,
            logoUrl: true,
            currency: true,
            vatRate: true,
            orderApprovalRequired: true,
          },
        },
      },
    })

    if (!session) {
      return reply.status(404).send({ error: 'Invalid table or PIN' })
    }

    return {
      sessionId: session.id,
      tableId: session.tableId,
      tableNumber: session.table.number,
      tableLabel: session.table.label,
      guestCount: session.guestCount,
      openedAt: session.openedAt,
      tenant: session.tenant,
    }
  })

  /**
   * GET /api/sessions/:id
   * Returns full session detail with orders and items
   * Requires auth (kiosk uses this)
   */
  fastify.get('/api/sessions/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const session = await fastify.prisma.tableSession.findFirst({
      where: { id, tenantId },
      include: {
        table: { select: { number: true, label: true } },
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' })
    }

    return session
  })
}

module.exports = sessionRoutes
