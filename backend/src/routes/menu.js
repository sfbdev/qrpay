const { authenticate, requireRole } = require('../middleware/auth')

async function menuRoutes(fastify) {
  /**
   * GET /api/menu?tenant=freya-cafe
   * Public route: returns all categories with items for a tenant
   */
  fastify.get('/api/menu', {
    schema: {
      querystring: {
        type: 'object',
        required: ['tenant'],
        properties: {
          tenant: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { tenant: tenantSlug } = request.query

    const tenantRecord = await fastify.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })

    if (!tenantRecord) {
      return reply.status(404).send({ error: 'Tenant not found' })
    }

    const categories = await fastify.prisma.menuCategory.findMany({
      where: { tenantId: tenantRecord.id },
      include: {
        items: {
          where: { available: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return {
      tenant: {
        name: tenantRecord.name,
        brandColor: tenantRecord.brandColor,
        logoUrl: tenantRecord.logoUrl,
        currency: tenantRecord.currency,
      },
      categories,
    }
  })

  // --- Protected routes below ---

  /**
   * GET /api/menu/categories
   */
  fastify.get('/api/menu/categories', {
    preHandler: authenticate,
  }, async (request) => {
    const categories = await fastify.prisma.menuCategory.findMany({
      where: { tenantId: request.user.tenantId },
      include: { items: true },
      orderBy: { sortOrder: 'asc' },
    })

    return categories
  })

  /**
   * POST /api/menu/categories
   */
  fastify.post('/api/menu/categories', {
    preHandler: [authenticate, requireRole('ADMIN')],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          sortOrder: { type: 'integer' },
        },
      },
    },
  }, async (request) => {
    const { name, sortOrder } = request.body

    const category = await fastify.prisma.menuCategory.create({
      data: {
        tenantId: request.user.tenantId,
        name,
        sortOrder: sortOrder || 0,
      },
    })

    return category
  })

  /**
   * PUT /api/menu/categories/:id
   */
  fastify.put('/api/menu/categories/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          sortOrder: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const category = await fastify.prisma.menuCategory.findFirst({
      where: { id, tenantId },
    })

    if (!category) {
      return reply.status(404).send({ error: 'Category not found' })
    }

    const updated = await fastify.prisma.menuCategory.update({
      where: { id },
      data: request.body,
    })

    return updated
  })

  /**
   * DELETE /api/menu/categories/:id
   */
  fastify.delete('/api/menu/categories/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const category = await fastify.prisma.menuCategory.findFirst({
      where: { id, tenantId },
    })

    if (!category) {
      return reply.status(404).send({ error: 'Category not found' })
    }

    await fastify.prisma.menuCategory.delete({ where: { id } })

    return { success: true }
  })

  /**
   * POST /api/menu/items
   */
  fastify.post('/api/menu/items', {
    preHandler: [authenticate, requireRole('ADMIN')],
    schema: {
      body: {
        type: 'object',
        required: ['categoryId', 'name', 'price'],
        properties: {
          categoryId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          available: { type: 'boolean' },
          requiresApproval: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { categoryId, name, description, price, available, requiresApproval } = request.body
    const { tenantId } = request.user

    // Verify category belongs to tenant
    const category = await fastify.prisma.menuCategory.findFirst({
      where: { id: categoryId, tenantId },
    })

    if (!category) {
      return reply.status(404).send({ error: 'Category not found' })
    }

    const item = await fastify.prisma.menuItem.create({
      data: {
        tenantId,
        categoryId,
        name,
        description: description || null,
        price,
        available: available !== undefined ? available : true,
        requiresApproval: requiresApproval !== undefined ? requiresApproval : false,
      },
    })

    return item
  })

  /**
   * PUT /api/menu/items/:id
   */
  fastify.put('/api/menu/items/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
    schema: {
      body: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          available: { type: 'boolean' },
          requiresApproval: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const item = await fastify.prisma.menuItem.findFirst({
      where: { id, tenantId },
    })

    if (!item) {
      return reply.status(404).send({ error: 'Menu item not found' })
    }

    const updated = await fastify.prisma.menuItem.update({
      where: { id },
      data: request.body,
    })

    return updated
  })

  /**
   * DELETE /api/menu/items/:id
   */
  fastify.delete('/api/menu/items/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params
    const { tenantId } = request.user

    const item = await fastify.prisma.menuItem.findFirst({
      where: { id, tenantId },
    })

    if (!item) {
      return reply.status(404).send({ error: 'Menu item not found' })
    }

    await fastify.prisma.menuItem.delete({ where: { id } })

    return { success: true }
  })
}

module.exports = menuRoutes
