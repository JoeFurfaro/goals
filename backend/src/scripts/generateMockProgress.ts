import { prisma } from '../db'
import { getLastNWeeks } from '../utils/weekUtils'

async function generateMockProgress() {
  console.log('🎲 Generating mock progress data...\n')

  try {
    // Fetch all goals
    const goals = await prisma.goal.findMany()

    if (goals.length === 0) {
      console.log('⚠️  No goals found. Create some goals first!')
      return
    }

    console.log(`Found ${goals.length} goal(s):\n`)

    // Generate progress for last 10 weeks including current week
    const weeks = getLastNWeeks(10)
    let totalRecords = 0

    for (const goal of goals) {
      console.log(`📊 ${goal.icon} ${goal.title}`)
      console.log(`   Type: ${goal.type}`)

      let recordsCreated = 0

      for (const { weekStart, weekEnd } of weeks) {
        // Check if progress already exists for this week
        const existing = await prisma.weeklyProgress.findUnique({
          where: {
            goalId_weekStart: {
              goalId: goal.id,
              weekStart,
            },
          },
        })

        if (existing) {
          console.log(`   ⏭️  Skipping ${weekStart.toISOString().split('T')[0]} (already exists)`)
          continue
        }

        let value: number | null = null
        let completed: boolean | null = null

        if (goal.type === 'MEASURABLE' && goal.target) {
          // Generate realistic values around the target
          // 70% chance of completing, with variance
          const completionRate = Math.random()

          if (completionRate < 0.7) {
            // Completed: 90-110% of target
            value = goal.target * (0.9 + Math.random() * 0.2)
          } else if (completionRate < 0.9) {
            // Partially completed: 50-90% of target
            value = goal.target * (0.5 + Math.random() * 0.4)
          } else {
            // Not completed: 0-50% of target
            value = goal.target * (Math.random() * 0.5)
          }

          // Round to 1 decimal place
          value = Math.round(value * 10) / 10
        } else if (goal.type === 'YES_NO') {
          // 70% chance of completing yes/no goals
          completed = Math.random() < 0.7
        }

        // Create progress record
        await prisma.weeklyProgress.create({
          data: {
            goalId: goal.id,
            weekStart,
            weekEnd,
            value,
            completed,
          },
        })

        recordsCreated++
        totalRecords++
      }

      console.log(`   ✅ Created ${recordsCreated} week(s) of progress\n`)
    }

    console.log(`\n🎉 Done! Generated ${totalRecords} progress records across ${goals.length} goal(s)`)
  } catch (error) {
    console.error('❌ Error generating mock data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generateMockProgress()
