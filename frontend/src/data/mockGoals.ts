import { Goal } from '@/types/goal'

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Run 10km',
    type: 'measurable',
    target: 10,
    current: 6.5,
    unit: 'km',
    icon: '🏃'
  },
  {
    id: '2',
    title: 'Call Mom',
    type: 'yes-no',
    completed: false,
    icon: '📞'
  },
  {
    id: '3',
    title: 'Read 3 hours',
    type: 'measurable',
    target: 3,
    current: 1.5,
    unit: 'hours',
    icon: '📚'
  },
  {
    id: '4',
    title: 'Meditate daily',
    type: 'yes-no',
    completed: true,
    icon: '🧘'
  },
  {
    id: '5',
    title: 'Drink 2L water',
    type: 'measurable',
    target: 2,
    current: 0,
    unit: 'L',
    icon: '💧'
  },
  {
    id: '6',
    title: 'Write in journal',
    type: 'yes-no',
    completed: false,
    icon: '✍️'
  },
]

export function getWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diffToMonday)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}
