const { authenticate, requireRole } = require('../middleware/auth')

async function paymentRoutes(fastify) {
  /**
   * POST /api/payments
   * Body: { sessionId, amount, method }
   * Records payment and closes the session + table
   */
  fastify.post('/api/payments', {
    preHandler: [authenticate, requireRole('ADMIN', 'CASHIER')],
    schema: {
      body: {
        type: 'object',
        required: ['sessionId', 'amount', 'method'],
        properties: {
          sessionId: { type: 'string' },
          amount: { type: 'number' },
          method: { type: 'string', enum: ['CASH', 'CARD', 'SPLIT'] },
        },
      },
    },
  }, async (request, reply) => {
    const { sessionId, amount, method } = request.body
    const { tenantId } = request.user

    // Validate session
    const session = await fastify.prisma.tableSession.findFirst({
      where: { id: sessionId, tenantId, status: 'ACTIVE' },
      include: {
        table: { select: { id: true, number: true } },
      },
    })

    if (!session) {
      return reply.status(404).send({ error: 'Active session not found' })
    }

    // Create payment, close session, set table to EMPTY -- all in a transaction
    const [payment] = await fastify.prisma.$transaction([
      fastify.prisma.payment.create({
        data: {
          sessionId,
          tenantId,
          amount,
          method,
        },
      }),
      fastify.prisma.tableSession.update({
        where: { id: sessionId },
        data: { status: 'CLOSED', closedAt: new Date() },
      }),
      fastify.prisma.table.update({
        where: { id: session.tableId },
        data: { status: 'EMPTY' },
      }),
    ])

    // Broadcast table closed
    fastify.broadcast(tenantId, {
      type: 'TABLE_CLOSED',
      tableId: session.tableId,
      tableNumber: session.table.number,
    })

    return payment
  })
}

module.exports = paymentRoutes
