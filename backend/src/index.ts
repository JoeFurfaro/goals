import { buildServer } from './server'
import { config } from './config'
import { prisma } from './db'

async function start() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Build and start server
    const server = await buildServer()

    await server.listen({
      port: config.port,
      host: '0.0.0.0',
    })

    console.log(`🚀 Server is running on http://localhost:${config.port}`)
    console.log(`📝 Health check: http://localhost:${config.port}/health`)
  } catch (err) {
    console.error('❌ Error starting server:', err)
    process.exit(1)
  }
}

start()
