const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const JWT_SECRET = process.env.JWT_SECRET

async function authRoutes(fastify) {
  /**
   * POST /auth/login
   * Body: { tenantSlug, username, password }
   * Returns: { token, user: { id, name, role, tenantId, tenantSlug } }
   */
  fastify.post('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['tenantSlug', 'username', 'password'],
        properties: {
          tenantSlug: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { tenantSlug, username, password } = request.body

    // Find tenant
    const tenant = await fastify.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    })

    if (!tenant) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    // Find user
    const user = await fastify.prisma.user.findUnique({
      where: {
        tenantId_username: {
          tenantId: tenant.id,
          username,
        },
      },
    })

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
      },
    }
  })
}

module.exports = authRoutes
