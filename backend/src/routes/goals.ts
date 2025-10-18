import { FastifyInstance } from 'fastify'
import { prisma } from '../db'
import { GoalType } from '@prisma/client'

export async function goalRoutes(server: FastifyInstance) {
  // Get all goals
  server.get('/goals', async (request, reply) => {
    try {
      const goals = await prisma.goal.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      })
      return goals
    } catch (error) {
      server.log.error(error)
      reply.status(500).send({ error: 'Failed to fetch goals' })
    }
  })

  // Get single goal
  server.get('/goals/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const goal = await prisma.goal.findUnique({
        where: { id },
      })

      if (!goal) {
        return reply.status(404).send({ error: 'Goal not found' })
      }

      return goal
    } catch (error) {
      server.log.error(error)
      reply.status(500).send({ error: 'Failed to fetch goal' })
    }
  })

  // Create goal
  server.post('/goals', async (request, reply) => {
    try {
      const body = request.body as {
        title: string
        type: 'MEASURABLE' | 'YES_NO'
        target?: number
        unit?: string
        icon?: string
      }

      const goal = await prisma.goal.create({
        data: {
          title: body.title,
          type: body.type,
          target: body.target,
          unit: body.unit,
          icon: body.icon || '🎯',
        },
      })

      reply.status(201).send(goal)
    } catch (error) {
      server.log.error(error)
      reply.status(500).send({ error: 'Failed to create goal' })
    }
  })

  // Update goal
  server.put('/goals/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = request.body as {
        title?: string
        type?: 'MEASURABLE' | 'YES_NO'
        target?: number
        unit?: string
        icon?: string
      }

      const goal = await prisma.goal.update({
        where: { id },
        data: {
          title: body.title,
          type: body.type,
          target: body.target,
          unit: body.unit,
          icon: body.icon,
        },
      })

      return goal
    } catch (error) {
      server.log.error(error)
      reply.status(500).send({ error: 'Failed to update goal' })
    }
  })

  // Delete goal
  server.delete('/goals/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      await prisma.goal.delete({
        where: { id },
      })

      reply.status(204).send()
    } catch (error) {
      server.log.error(error)
      reply.status(500).send({ error: 'Failed to delete goal' })
    }
  })
}
