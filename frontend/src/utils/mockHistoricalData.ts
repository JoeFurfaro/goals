import { Goal } from '@/types/goal'
import { subWeeks, startOfWeek, endOfWeek, format } from 'date-fns'

export interface WeeklyData {
  weekStart: Date
  weekEnd: Date
  weekLabel: string
  value?: number
  completed?: boolean
  isCurrent?: boolean
}

export function generateHistoricalData(goal: Goal, weeksBack: number): WeeklyData[] {
  const data: WeeklyData[] = []
  const now = new Date()

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekDate = subWeeks(now, i)
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
    const isCurrent = i === 0

    const weekLabel = format(weekStart, 'MMM d')

    if (goal.type === 'measurable' && goal.target) {
      // Generate realistic numerical data
      let value: number

      if (isCurrent) {
        // Use current actual value
        value = goal.current || 0
      } else {
        // Generate random data around the target (50% to 120% of target)
        const randomFactor = 0.5 + Math.random() * 0.7
        value = Math.round(goal.target * randomFactor * 10) / 10

        // Add some variability - occasionally hit or miss the target significantly
        if (Math.random() > 0.7) {
          value = Math.round(goal.target * (0.9 + Math.random() * 0.3) * 10) / 10
        }
      }

      data.push({
        weekStart,
        weekEnd,
        weekLabel,
        value,
        isCurrent,
      })
    } else if (goal.type === 'yes-no') {
      // Generate boolean data with ~70% completion rate for past weeks
      let completed: boolean

      if (isCurrent) {
        completed = goal.completed || false
      } else {
        completed = Math.random() > 0.3
      }

      data.push({
        weekStart,
        weekEnd,
        weekLabel,
        completed,
        isCurrent,
      })
    }
  }

  return data
}
