const fp = require('fastify-plugin')
const url = require('url')

async function websocketPlugin(fastify) {
  // Map: tenantId -> Set<WebSocket>
  const clients = new Map()

  fastify.register(require('@fastify/websocket'))

  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket, req) => {
      const query = url.parse(req.url, true).query
      const tenantSlug = query.tenantSlug

      if (!tenantSlug) {
        socket.close(4000, 'tenantSlug required')
        return
      }

      // Resolve tenantSlug to tenantId and subscribe
      fastify.prisma.tenant
        .findUnique({ where: { slug: tenantSlug } })
        .then((tenant) => {
          if (!tenant) {
            socket.close(4001, 'Tenant not found')
            return
          }

          const tenantId = tenant.id

          if (!clients.has(tenantId)) {
            clients.set(tenantId, new Set())
          }
          clients.get(tenantId).add(socket)

          socket.on('close', () => {
            const set = clients.get(tenantId)
            if (set) {
              set.delete(socket)
              if (set.size === 0) clients.delete(tenantId)
            }
          })

          socket.on('error', () => {
            const set = clients.get(tenantId)
            if (set) {
              set.delete(socket)
              if (set.size === 0) clients.delete(tenantId)
            }
          })
        })
        .catch(() => {
          socket.close(4002, 'Internal error')
        })
    })
  })

  // Broadcast helper: send event to all connections of a tenant
  function broadcast(tenantId, event) {
    const set = clients.get(tenantId)
    if (!set) return
    const payload = JSON.stringify(event)
    for (const socket of set) {
      if (socket.readyState === 1) {
        socket.send(payload)
      }
    }
  }

  fastify.decorate('broadcast', broadcast)
}

module.exports = fp(websocketPlugin)
