const jwt = require('jsonwebtoken')

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const JWT_SECRET = process.env.JWT_SECRET

/**
 * Fastify preHandler hook that verifies JWT from Authorization header.
 * Decorates request with `user` { userId, tenantId, role }.
 */
async function authenticate(request, reply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    request.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
    }
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}

/**
 * Role-based guard factory.
 * Usage: { preHandler: [authenticate, requireRole('ADMIN', 'CASHIER')] }
 */
function requireRole(...roles) {
  return async function (request, reply) {
    if (!request.user || !roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Insufficient permissions' })
    }
  }
}

module.exports = { authenticate, requireRole }
