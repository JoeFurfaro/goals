/**
 * Get the start and end of the week for a given date.
 * Week starts on Monday at 00:00 and ends on Sunday at 23:59:59.999
 */
export function getWeekBoundaries(date: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Adjust to Monday

  const weekStart = new Date(d)
  weekStart.setDate(d.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return { weekStart, weekEnd }
}

/**
 * Get an array of week boundaries for the last N weeks including current week
 */
export function getLastNWeeks(numWeeks: number): Array<{ weekStart: Date; weekEnd: Date }> {
  const weeks = []
  const now = new Date()

  for (let i = numWeeks - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i * 7)
    weeks.push(getWeekBoundaries(date))
  }

  return weeks
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const { weekStart, weekEnd } = getWeekBoundaries()
  return date >= weekStart && date <= weekEnd
}
