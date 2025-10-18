import { useState, useEffect } from 'react'
import { Goal } from '@/types/goal'
import { GoalCard } from '@/components/GoalCard'
import { getWeekDates } from '@/data/mockGoals'
import { Checkbox } from '@/components/ui/checkbox'
import { useGoalStore } from '@/store/goalStore'
import { Target, Loader2 } from 'lucide-react'

export function Home() {
  const { goals, loading, fetchGoals, updateGoalProgress } = useGoalStore()
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)
  const { weekStart, weekEnd } = getWeekDates()

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleGoalUpdate = (goalId: string, value: number | boolean) => {
    updateGoalProgress(goalId, value)
  }

  const isGoalComplete = (goal: Goal) => {
    return goal.type === 'yes-no'
      ? goal.completed
      : goal.current !== undefined && goal.target !== undefined && goal.current >= goal.target
  }

  const completedGoals = goals.filter(isGoalComplete).length
  const totalGoals = goals.length

  const filteredGoals = showIncompleteOnly
    ? goals.filter(goal => !isGoalComplete(goal))
    : goals

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Target className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Weekly Goals</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {formatDate(weekStart)} - {formatDate(weekEnd)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {completedGoals} of {totalGoals} goals completed
            </h2>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Checkbox
                checked={showIncompleteOnly}
                onChange={(e) => setShowIncompleteOnly(e.target.checked)}
              />
              <span>Show incomplete only</span>
            </label>
          </div>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleGoalUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {showIncompleteOnly ? 'All goals completed! 🎉' : 'No goals yet. Create some in Manage Goals.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
