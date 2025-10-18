import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config'

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  })

  // Register CORS
  await server.register(cors, {
    origin: config.frontendUrl,
    credentials: true,
  })

  // Health check route
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Register API routes
  const { goalRoutes } = await import('./routes/goals')
  await server.register(goalRoutes, { prefix: '/api' })

  const { progressRoutes } = await import('./routes/progress')
  await server.register(progressRoutes, { prefix: '/api' })

  return server
}
