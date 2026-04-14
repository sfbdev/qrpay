require('dotenv').config()

const buildServer = require('./server')

const PORT = parseInt(process.env.PORT, 10) || 3000

async function start() {
  const server = buildServer()

  try {
    await server.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
