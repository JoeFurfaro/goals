import { FastifyInstance } from 'fastify'
import { prisma } from '../db'
import { getWeekBoundaries, getLastNWeeks } from '../utils/weekUtils.js'

export async function progressRoutes(server: FastifyInstance) {
  // Upsert current week progress
  server.put<{
    Params: { goalId: string }
    Body: { value?: number; completed?: boolean }
  }>('/goals/:goalId/progress', async (request, reply) => {
    const { goalId } = request.params
    const { value, completed } = request.body

    // Verify goal exists
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    })

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' })
    }

    // Validate progress type matches goal type
    if (goal.type === 'MEASURABLE' && value === undefined) {
      return reply.status(400).send({ error: 'Value required for measurable goals' })
    }

    if (goal.type === 'YES_NO' && completed === undefined) {
      return reply.status(400).send({ error: 'Completed status required for yes/no goals' })
    }

    const { weekStart, weekEnd } = getWeekBoundaries()

    // Upsert progress for current week
    const progress = await prisma.weeklyProgress.upsert({
      where: {
        goalId_weekStart: {
          goalId,
          weekStart,
        },
      },
      update: {
        value: goal.type === 'MEASURABLE' ? value : null,
        completed: goal.type === 'YES_NO' ? completed : null,
      },
      create: {
        goalId,
        weekStart,
        weekEnd,
        value: goal.type === 'MEASURABLE' ? value : null,
        completed: goal.type === 'YES_NO' ? completed : null,
      },
    })

    return progress
  })

  // Get current week progress
  server.get<{
    Params: { goalId: string }
  }>('/goals/:goalId/progress/current', async (request, reply) => {
    const { goalId } = request.params

    const { weekStart } = getWeekBoundaries()

    const progress = await prisma.weeklyProgress.findUnique({
      where: {
        goalId_weekStart: {
          goalId,
          weekStart,
        },
      },
    })

    // Return null if no progress for current week (sparse storage)
    return progress
  })

  // Get historical progress for last N weeks
  server.get<{
    Params: { goalId: string }
    Querystring: { weeks?: string }
  }>('/goals/:goalId/progress/history', async (request, reply) => {
    const { goalId } = request.params
    const weeks = parseInt(request.query.weeks || '10', 10)

    if (weeks < 1 || weeks > 52) {
      return reply.status(400).send({ error: 'Weeks must be between 1 and 52' })
    }

    // Verify goal exists
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    })

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' })
    }

    // Get week boundaries for last N weeks
    const weekBoundaries = getLastNWeeks(weeks)
    const weekStarts = weekBoundaries.map(w => w.weekStart)

    // Fetch progress for those weeks
    const progressRecords = await prisma.weeklyProgress.findMany({
      where: {
        goalId,
        weekStart: {
          in: weekStarts,
        },
      },
      orderBy: {
        weekStart: 'asc',
      },
    })

    // Create a map for quick lookup
    const progressMap = new Map(
      progressRecords.map(p => [p.weekStart.getTime(), p])
    )

    // Fill in missing weeks with default values (sparse -> dense for frontend)
    const history = weekBoundaries.map(({ weekStart, weekEnd }) => {
      const existing = progressMap.get(weekStart.getTime())

      if (existing) {
        return existing
      }

      // Return default values for weeks with no data
      return {
        id: null,
        goalId,
        weekStart,
        weekEnd,
        value: goal.type === 'MEASURABLE' ? 0 : null,
        completed: goal.type === 'YES_NO' ? false : null,
        createdAt: null,
        updatedAt: null,
      }
    })

    return history
  })
}
