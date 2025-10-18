export type GoalType = 'measurable' | 'yes-no'

export interface Goal {
  id: string
  title: string
  type: GoalType
  // For measurable goals
  target?: number
  current?: number
  unit?: string
  // For yes-no goals
  completed?: boolean
  icon?: string
}

export interface WeekGoals {
  weekStart: Date
  weekEnd: Date
  goals: Goal[]
}
