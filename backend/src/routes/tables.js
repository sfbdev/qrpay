const { authenticate, requireRole } = require('../middleware/auth')

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

async function tableRoutes(fastify) {
  // All table routes require authentication
  fastify.addHook('preHandler', authenticate)

  /**
   * GET /api/tables
   */
  fastify.get('/api/tables', async (request) => {
    const tables = await fastify.prisma.table.findMany({
      where: { tenantId: request.user.tenantId },
      include: {
        sessions: {
          where: { status: 'ACTIVE' },
          include: {
            orders: {
              include: { items: true },
            },
          },
        },
      },
      orderBy: { number: 'asc' },
    })

    return tables
  })

  /**
   * POST /api/tables
   */
  fastify.post('/api/tables', {
    preHandler: requireRole('ADMIN', 'CASHIER'),
    schema: {
      body: {
        type: 'object',
        required: ['number'],
        properties: {
          number: { type: 'integer' },
          label: { type: 'string' },
          capacity: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { number, label, capacity } = request.body
    const { tenantId } = request.user

    // Check duplicate
    const existing = await fastify.prisma.table.findUnique({
      where: { tenantId_number: { tenantId, number } },
    })

    if (existing) {
      return reply.status(409).send({ error: `Table ${number} already exists` })
    }

    const table = await fastify.prisma.table.create({
      data: {
        tenantId,
        number,
        label: label || `Masa ${number}`,
        capacity: capacity || 4,
      },
    })

    return table
  })

  /**
   * PUT /api/tables/:id
   */
  fastify.put('/api/tables/:id', {
    preHandler: requireRole('ADMIN', 'CASHIER'),
    schema: {
      body: {
        type: 'object',
        properties: {
          number: { type: 'integer' },
          label: { type: 'string' },
          capacity: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user
    const data = request.body

    const table = await fastify.prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!table) {
      return reply.status(404).send({ error: 'Table not found' })
    }

    const updated = await fastify.prisma.table.update({
      where: { id },
      data,
    })

    return updated
  })

  /**
   * DELETE /api/tables/:id
   */
  fastify.delete('/api/tables/:id', {
    preHandler: requireRole('ADMIN'),
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const table = await fastify.prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!table) {
      return reply.status(404).send({ error: 'Table not found' })
    }

    if (table.status === 'OPEN') {
      return reply.status(400).send({ error: 'Cannot delete an open table' })
    }

    await fastify.prisma.table.delete({ where: { id } })

    return { success: true }
  })

  /**
   * POST /api/tables/:id/open
   * Body: { guestCount? }
   * Opens a table and creates a new session with a 4-digit PIN
   */
  fastify.post('/api/tables/:id/open', {
    preHandler: requireRole('ADMIN', 'CASHIER', 'WAITER'),
    schema: {
      body: {
        type: 'object',
        properties: {
          guestCount: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user
    const guestCount = request.body?.guestCount || 1

    const table = await fastify.prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!table) {
      return reply.status(404).send({ error: 'Table not found' })
    }

    if (table.status === 'OPEN') {
      return reply.status(400).send({ error: 'Table is already open' })
    }

    const pin = generatePin()

    const [session] = await fastify.prisma.$transaction([
      fastify.prisma.tableSession.create({
        data: {
          tableId: id,
          tenantId,
          pin,
          guestCount,
        },
      }),
      fastify.prisma.table.update({
        where: { id },
        data: { status: 'OPEN' },
      }),
    ])

    fastify.broadcast(tenantId, {
      type: 'TABLE_OPENED',
      tableId: id,
      tableNumber: table.number,
      pin,
    })

    return { ...session, tableNumber: table.number }
  })

  /**
   * POST /api/tables/:id/close
   * Closes the active session and sets table to EMPTY
   */
  fastify.post('/api/tables/:id/close', {
    preHandler: requireRole('ADMIN', 'CASHIER'),
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const table = await fastify.prisma.table.findFirst({
      where: { id, tenantId },
    })

    if (!table) {
      return reply.status(404).send({ error: 'Table not found' })
    }

    if (table.status !== 'OPEN') {
      return reply.status(400).send({ error: 'Table is not open' })
    }

    // Find active session
    const session = await fastify.prisma.tableSession.findFirst({
      where: { tableId: id, tenantId, status: 'ACTIVE' },
    })

    if (!session) {
      return reply.status(400).send({ error: 'No active session found' })
    }

    await fastify.prisma.$transaction([
      fastify.prisma.tableSession.update({
        where: { id: session.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      }),
      fastify.prisma.table.update({
        where: { id },
        data: { status: 'EMPTY' },
      }),
    ])

    fastify.broadcast(tenantId, {
      type: 'TABLE_CLOSED',
      tableId: id,
      tableNumber: table.number,
    })

    return { success: true }
  })
}

module.exports = tableRoutes
