import { Goal, GoalType } from '@/types/goal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Type mapping between frontend and backend
const mapTypeToBackend = (type: GoalType): 'MEASURABLE' | 'YES_NO' => {
  return type === 'measurable' ? 'MEASURABLE' : 'YES_NO'
}

const mapTypeToFrontend = (type: 'MEASURABLE' | 'YES_NO'): GoalType => {
  return type === 'MEASURABLE' ? 'measurable' : 'yes-no'
}

interface BackendGoal {
  id: string
  title: string
  type: 'MEASURABLE' | 'YES_NO'
  target: number | null
  unit: string | null
  icon: string
  createdAt: string
  updatedAt: string
}

const mapGoalFromBackend = (backendGoal: BackendGoal): Goal => {
  return {
    id: backendGoal.id,
    title: backendGoal.title,
    type: mapTypeToFrontend(backendGoal.type),
    target: backendGoal.target ?? undefined,
    unit: backendGoal.unit ?? undefined,
    icon: backendGoal.icon,
    // Progress fields will be fetched separately from backend
    current: undefined,
    completed: undefined,
  }
}

export const goalsApi = {
  async getAll(): Promise<Goal[]> {
    const response = await fetch(`${API_URL}/goals`)
    if (!response.ok) {
      throw new Error('Failed to fetch goals')
    }
    const data: BackendGoal[] = await response.json()
    return data.map(mapGoalFromBackend)
  },

  async getById(id: string): Promise<Goal> {
    const response = await fetch(`${API_URL}/goals/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch goal')
    }
    const data: BackendGoal = await response.json()
    return mapGoalFromBackend(data)
  },

  async create(goal: Omit<Goal, 'id' | 'current' | 'completed'>): Promise<Goal> {
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: goal.title,
        type: mapTypeToBackend(goal.type),
        target: goal.target,
        unit: goal.unit,
        icon: goal.icon,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create goal')
    }

    const data: BackendGoal = await response.json()
    return mapGoalFromBackend(data)
  },

  async update(id: string, goal: Partial<Goal>): Promise<Goal> {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: goal.title,
        type: goal.type ? mapTypeToBackend(goal.type) : undefined,
        target: goal.target,
        unit: goal.unit,
        icon: goal.icon,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update goal')
    }

    const data: BackendGoal = await response.json()
    return mapGoalFromBackend(data)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete goal')
    }
  },
}

// Progress API
export interface WeeklyProgress {
  id: string | null
  goalId: string
  weekStart: Date
  weekEnd: Date
  value: number | null
  completed: boolean | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface BackendProgress {
  id: string | null
  goalId: string
  weekStart: string
  weekEnd: string
  value: number | null
  completed: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

const mapProgressFromBackend = (backendProgress: BackendProgress): WeeklyProgress => {
  return {
    ...backendProgress,
    weekStart: new Date(backendProgress.weekStart),
    weekEnd: new Date(backendProgress.weekEnd),
    createdAt: backendProgress.createdAt ? new Date(backendProgress.createdAt) : null,
    updatedAt: backendProgress.updatedAt ? new Date(backendProgress.updatedAt) : null,
  }
}

export const progressApi = {
  async updateProgress(goalId: string, data: { value?: number; completed?: boolean }): Promise<WeeklyProgress> {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update progress')
    }

    const backendData: BackendProgress = await response.json()
    return mapProgressFromBackend(backendData)
  },

  async getCurrentProgress(goalId: string): Promise<WeeklyProgress | null> {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress/current`)

    if (!response.ok) {
      throw new Error('Failed to fetch current progress')
    }

    const backendData: BackendProgress | null = await response.json()
    return backendData ? mapProgressFromBackend(backendData) : null
  },

  async getHistoricalProgress(goalId: string, weeks: number = 10): Promise<WeeklyProgress[]> {
    const response = await fetch(`${API_URL}/goals/${goalId}/progress/history?weeks=${weeks}`)

    if (!response.ok) {
      throw new Error('Failed to fetch historical progress')
    }

    const backendData: BackendProgress[] = await response.json()
    return backendData.map(mapProgressFromBackend)
  },
}
