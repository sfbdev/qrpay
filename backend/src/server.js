const fastify = require('fastify')

function buildServer(opts = {}) {
  const app = fastify({
    logger: {
      level: opts.logLevel || 'info',
    },
    ...opts,
  })

  // CORS
  app.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
  })

  // Plugins
  app.register(require('./plugins/prisma'))
  app.register(require('./plugins/websocket'))

  // Routes
  app.register(require('./routes/auth'))
  app.register(require('./routes/tables'))
  app.register(require('./routes/sessions'))
  app.register(require('./routes/menu'))
  app.register(require('./routes/orders'))
  app.register(require('./routes/payments'))
  app.register(require('./routes/dashboard'))
  app.register(require('./routes/settings'))

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  return app
}

module.exports = buildServer
