import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Goal } from '@/types/goal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Check, X, TrendingUp } from 'lucide-react'

interface GoalCardProps {
  goal: Goal
  onUpdate: (goalId: string, value: number | boolean) => void
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleNumericalSubmit = () => {
    const value = parseFloat(inputValue)
    if (!isNaN(value) && value >= 0) {
      onUpdate(goal.id, value)
      setInputValue('')
      setIsEditing(false)
    }
  }

  const handleBooleanToggle = (completed: boolean) => {
    onUpdate(goal.id, completed)
  }

  const isMeasurableComplete = goal.type === 'measurable' &&
    goal.current !== undefined &&
    goal.target !== undefined &&
    goal.current >= goal.target

  const isYesNoComplete = goal.type === 'yes-no' && goal.completed

  const isComplete = isMeasurableComplete || isYesNoComplete

  return (
    <Card className={`transition-all ${isComplete ? 'border-green-500 bg-green-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="text-3xl">{goal.icon}</span>
          <span className={isComplete ? 'line-through text-muted-foreground' : ''}>
            {goal.title}
          </span>
          {isComplete && (
            <Check className="ml-auto h-6 w-6 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goal.type === 'measurable' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {goal.current?.toFixed(1) || 0} / {goal.target} {goal.unit}
                </span>
              </div>
              <Progress
                value={goal.current || 0}
                max={goal.target || 100}
                className="h-3"
              />
              <div className="text-right text-xs text-muted-foreground">
                {Math.round(((goal.current || 0) / (goal.target || 1)) * 100)}% complete
              </div>
            </div>

            <div className="space-y-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full"
                >
                  Update Progress
                </Button>
              ) : (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={`Enter ${goal.unit}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumericalSubmit()}
                    className="h-8"
                    autoFocus
                  />
                  <Button onClick={handleNumericalSubmit} size="sm" className="h-8">
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setInputValue('')
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {goal.type === 'yes-no' && (
          <div className="space-y-3">
            {goal.completed ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-100 p-3 text-green-800">
                <Check className="h-5 w-5" />
                <span className="font-medium">Completed!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
                <X className="h-5 w-5" />
                <span className="font-medium">Not yet completed</span>
              </div>
            )}

            <div className="flex gap-2">
              {!goal.completed && (
                <Button
                  onClick={() => handleBooleanToggle(true)}
                  className="flex-1"
                >
                  Mark Complete
                </Button>
              )}
              {goal.completed && (
                <Button
                  onClick={() => handleBooleanToggle(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Mark Incomplete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* View History Button */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/goal/${goal.id}/history`)}
            className="w-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
