import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGoalStore } from '@/store/goalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { progressApi } from '@/api/goals'
import { WeeklyData } from '@/utils/mockHistoricalData'
import { format } from 'date-fns'

const TIME_RANGES = [
  { label: 'Last 10 weeks', weeks: 10 },
  { label: 'Last 6 months', weeks: 26 },
  { label: 'Last year', weeks: 52 },
]

export function GoalHistory() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const goals = useGoalStore((state) => state.goals)
  const goal = goals.find((g) => g.id === goalId)

  const [selectedRange, setSelectedRange] = useState(10)
  const [historicalData, setHistoricalData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!goal || !goalId) return

    const fetchHistoricalData = async () => {
      setLoading(true)
      try {
        const progressData = await progressApi.getHistoricalProgress(goalId, selectedRange)

        // Get current week boundaries to mark current week
        const now = new Date()
        const currentWeekStart = new Date(now)
        const day = currentWeekStart.getDay()
        const diff = day === 0 ? -6 : 1 - day
        currentWeekStart.setDate(now.getDate() + diff)
        currentWeekStart.setHours(0, 0, 0, 0)

        // Transform backend data to chart format
        const chartData: WeeklyData[] = progressData.map((progress) => {
          const weekStart = new Date(progress.weekStart)
          const weekEnd = new Date(progress.weekEnd)
          const isCurrent = weekStart.getTime() === currentWeekStart.getTime()

          return {
            weekStart,
            weekEnd,
            weekLabel: format(weekStart, 'MMM d'),
            value: progress.value ?? undefined,
            completed: progress.completed ?? undefined,
            isCurrent,
          }
        })

        setHistoricalData(chartData)
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [goal, goalId, selectedRange])

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Goal not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionRate = goal.type === 'yes-no'
    ? Math.round((historicalData.filter(d => d.completed).length / historicalData.length) * 100)
    : null

  const averageValue = goal.type === 'measurable'
    ? Math.round((historicalData.reduce((sum, d) => sum + (d.value || 0), 0) / historicalData.length) * 10) / 10
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl">{goal.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{goal.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {goal.type === 'measurable'
                  ? `Target: ${goal.target} ${goal.unit} per week`
                  : 'Complete each week'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium mr-2">Time Range:</span>
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.weeks}
                  variant={selectedRange === range.weeks ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRange(range.weeks)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goal.type === 'measurable'
                  ? `${goal.current || 0} ${goal.unit}`
                  : goal.completed ? '✅ Completed' : '⏳ Pending'}
              </div>
            </CardContent>
          </Card>

          {goal.type === 'measurable' && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageValue} {goal.unit}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {goal.target} {goal.unit}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Weeks at Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {historicalData.filter(d => (d.value || 0) >= (goal.target || 0)).length}
                    <span className="text-lg text-muted-foreground"> / {historicalData.length}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {goal.type === 'yes-no' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {historicalData.filter(d => d.completed).length} of {historicalData.length} weeks
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {goal.type === 'measurable' ? 'Progress Over Time' : 'Completion History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : goal.type === 'measurable' ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="weekLabel"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: goal.unit, angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    isAnimationActive={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as WeeklyData
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-semibold">{data.weekLabel}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(data.weekStart, 'MMM d')} - {format(data.weekEnd, 'MMM d, yyyy')}
                            </p>
                            <p className="text-lg font-bold text-primary mt-1">
                              {data.value} {goal.unit}
                            </p>
                            {data.isCurrent && (
                              <p className="text-xs text-blue-600 mt-1">Current Week</p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine
                    y={goal.target}
                    stroke="#ef4444"
                    strokeWidth={3}
                    label={{
                      value: `Target: ${goal.target} ${goal.unit}`,
                      position: 'insideTopRight',
                      fill: '#ef4444',
                      fontSize: 14,
                      fontWeight: 'bold'
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 8 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
                {historicalData.slice().reverse().map((week, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-2xl transition-all ${
                        week.completed
                          ? 'bg-green-100 border-2 border-green-500 shadow-md'
                          : week.isCurrent
                          ? 'bg-yellow-50 border-2 border-yellow-400 border-dashed'
                          : 'bg-red-50 border-2 border-red-300'
                      }`}
                      title={`${format(week.weekStart, 'MMM d')} - ${format(week.weekEnd, 'MMM d')}`}
                    >
                      {week.completed ? '✅' : week.isCurrent ? '⏳' : '❌'}
                    </div>
                    <span className="text-xs text-muted-foreground text-center">
                      {week.weekLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
