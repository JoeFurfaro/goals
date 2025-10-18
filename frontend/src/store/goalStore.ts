import { create } from 'zustand'
import { Goal } from '@/types/goal'
import { goalsApi, progressApi } from '@/api/goals'
import toast from 'react-hot-toast'

interface GoalStore {
  goals: Goal[]
  loading: boolean
  error: string | null

  // Fetch goals from API
  fetchGoals: () => Promise<void>

  // CRUD operations
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => Promise<void>
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Progress updates
  updateGoalProgress: (id: string, value: number | boolean) => Promise<void>
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null })
    try {
      const goals = await goalsApi.getAll()

      // Fetch current week progress for each goal
      const goalsWithProgress = await Promise.all(
        goals.map(async (goal) => {
          const progress = await progressApi.getCurrentProgress(goal.id)
          return {
            ...goal,
            current: progress?.value ?? undefined,
            completed: progress?.completed ?? undefined,
          }
        })
      )

      set({ goals: goalsWithProgress, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch goals'
      set({ error: message, loading: false })
      toast.error(message)
    }
  },

  addGoal: async (goalData) => {
    set({ loading: true, error: null })
    try {
      const newGoal = await goalsApi.create(goalData)

      // Initialize progress for new goal in backend
      if (newGoal.type === 'measurable') {
        await progressApi.updateProgress(newGoal.id, { value: 0 })
        newGoal.current = 0
      } else {
        await progressApi.updateProgress(newGoal.id, { completed: false })
        newGoal.completed = false
      }

      set(state => ({
        goals: [...state.goals, newGoal],
        loading: false,
      }))

      toast.success('Goal created successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create goal'
      set({ error: message, loading: false })
      toast.error(message)
      throw error
    }
  },

  updateGoal: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const updatedGoal = await goalsApi.update(id, updates)

      // Fetch current progress from backend
      const progress = await progressApi.getCurrentProgress(id)
      const goalWithProgress = {
        ...updatedGoal,
        current: progress?.value ?? undefined,
        completed: progress?.completed ?? undefined,
      }

      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === id ? goalWithProgress : goal
        ),
        loading: false,
      }))

      toast.success('Goal updated successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update goal'
      set({ error: message, loading: false })
      toast.error(message)
      throw error
    }
  },

  deleteGoal: async (id) => {
    set({ loading: true, error: null })
    try {
      await goalsApi.delete(id)

      // Progress is automatically deleted via CASCADE in database
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        loading: false,
      }))

      toast.success('Goal deleted successfully!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete goal'
      set({ error: message, loading: false })
      toast.error(message)
      throw error
    }
  },

  updateGoalProgress: async (id, value) => {
    try {
      // Update progress in backend
      if (typeof value === 'number') {
        await progressApi.updateProgress(id, { value })
      } else if (typeof value === 'boolean') {
        await progressApi.updateProgress(id, { completed: value })
      }

      // Update local state optimistically
      set(state => ({
        goals: state.goals.map(goal => {
          if (goal.id === id) {
            if (goal.type === 'measurable' && typeof value === 'number') {
              return { ...goal, current: value }
            } else if (goal.type === 'yes-no' && typeof value === 'boolean') {
              return { ...goal, completed: value }
            }
          }
          return goal
        }),
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update progress'
      toast.error(message)
      throw error
    }
  },
}))
