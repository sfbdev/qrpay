const { authenticate, requireRole } = require('../middleware/auth')

async function settingsRoutes(fastify) {
  /**
   * GET /api/settings
   * Tenant ayarlarını döner.
   */
  fastify.get('/api/settings', { preHandler: authenticate }, async (request, reply) => {
    const { tenantId } = request.user

    const tenant = await fastify.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        brandColor: true,
        secondaryColor: true,
        logoUrl: true,
        vatRate: true,
        vatMode: true,
        currency: true,
        receiptPrefix: true,
        defaultLang: true,
        soundNotif: true,
        visualNotif: true,
        orderApprovalRequired: true,
      },
    })

    if (!tenant) return reply.status(404).send({ error: 'Tenant not found' })

    return tenant
  })

  /**
   * PUT /api/settings
   * Tenant ayarlarını günceller.
   * Sadece ADMIN yapabilir.
   */
  fastify.put('/api/settings', {
    preHandler: [authenticate, requireRole('ADMIN')],
    schema: {
      body: {
        type: 'object',
        properties: {
          name:                 { type: 'string', minLength: 1 },
          brandColor:           { type: 'string' },
          secondaryColor:       { type: 'string' },
          vatRate:              { type: 'number', minimum: 0, maximum: 100 },
          vatMode:              { type: 'string', enum: ['inclusive', 'exclusive'] },
          currency:             { type: 'string' },
          receiptPrefix:        { type: 'string' },
          defaultLang:          { type: 'string', enum: ['tr', 'en'] },
          soundNotif:           { type: 'boolean' },
          visualNotif:          { type: 'boolean' },
          orderApprovalRequired:{ type: 'boolean' },
        },
      },
    },
  }, async (request) => {
    const { tenantId } = request.user

    const updated = await fastify.prisma.tenant.update({
      where: { id: tenantId },
      data: request.body,
      select: {
        name: true,
        brandColor: true,
        secondaryColor: true,
        logoUrl: true,
        vatRate: true,
        vatMode: true,
        currency: true,
        receiptPrefix: true,
        defaultLang: true,
        soundNotif: true,
        visualNotif: true,
        orderApprovalRequired: true,
      },
    })

    return updated
  })
}

module.exports = settingsRoutes
