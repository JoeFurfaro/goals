/**
 * Format a date in UTC timezone to avoid local timezone conversion issues.
 * This is important because the backend stores week boundaries at midnight UTC,
 * and we want to display them as-is without shifting to local timezone.
 */
export function formatUTC(date: Date, formatString: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const year = date.getUTCFullYear()
  const month = months[date.getUTCMonth()]
  const day = date.getUTCDate()

  // Support common format strings
  if (formatString === 'MMM d') {
    return `${month} ${day}`
  }

  if (formatString === 'MMM d, yyyy') {
    return `${month} ${day}, ${year}`
  }

  // Default: just return the date part
  return `${month} ${day}, ${year}`
}

/**
 * Get the current week start date in local time (for display purposes).
 * This matches what we send to the backend.
 */
export function getLocalWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday is start of week

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)

  return weekStart
}

/**
 * Check if a UTC date matches the current week in local time.
 * Used to mark the current week in historical data.
 */
export function isCurrentWeek(utcDate: Date): boolean {
  const currentWeekStart = getLocalWeekStart()

  // Extract date components in their respective timezones
  const utcYear = utcDate.getUTCFullYear()
  const utcMonth = utcDate.getUTCMonth()
  const utcDay = utcDate.getUTCDate()

  const localYear = currentWeekStart.getFullYear()
  const localMonth = currentWeekStart.getMonth()
  const localDay = currentWeekStart.getDate()

  return utcYear === localYear && utcMonth === localMonth && utcDay === localDay
}
