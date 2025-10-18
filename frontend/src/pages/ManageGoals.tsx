import { useState, useRef, useEffect } from 'react'
import { useGoalStore } from '@/store/goalStore'
import { Goal, GoalType } from '@/types/goal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Settings, Plus, Trash2, Edit2, Check, X, AlertTriangle, Loader2 } from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

interface FormData {
  title: string
  type: GoalType
  target: string
  unit: string
  icon: string
}

interface GoalFormProps {
  formData: FormData
  setFormData: (data: FormData) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
  showEmojiPicker: string | null
  setShowEmojiPicker: (value: string | null) => void
  handleEmojiClick: (emojiData: EmojiClickData) => void
  isValid: boolean
}

function GoalForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  isValid
}: GoalFormProps) {
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null)
      }
    }

    if (showEmojiPicker === 'form') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker, setShowEmojiPicker])

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-lg">{submitLabel === 'Create' ? 'New Goal' : 'Edit Goal'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Run every week"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Goal Type</label>
          <div className="flex gap-2">
            <Button
              variant={formData.type === 'measurable' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, type: 'measurable' })}
              className="flex-1"
            >
              Measurable
            </Button>
            <Button
              variant={formData.type === 'yes-no' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, type: 'yes-no' })}
              className="flex-1"
            >
              Yes/No
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {formData.type === 'measurable'
              ? 'Track progress with numbers (e.g., 10km, 3 hours)'
              : 'Track completion with a simple yes or no'}
          </p>
        </div>

        {formData.type === 'measurable' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                step="0.1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., km, hours, pages"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Icon</label>
          <div className="relative" ref={emojiPickerRef}>
            <Button
              variant="outline"
              onClick={() => setShowEmojiPicker(showEmojiPicker ? null : 'form')}
              className="w-full justify-start text-3xl h-14"
            >
              {formData.icon}
            </Button>
            {showEmojiPicker === 'form' && (
              <div className="absolute z-10 mt-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={onSubmit} className="flex-1" disabled={!isValid}>
            {submitLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
        {!isValid && (
          <p className="text-sm text-destructive">
            Please fill in all required fields
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function ManageGoals() {
  const { goals, loading, fetchGoals, addGoal, updateGoal, deleteGoal } = useGoalStore()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    type: 'measurable' as GoalType,
    target: '',
    unit: '',
    icon: '🎯',
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'measurable',
      target: '',
      unit: '',
      icon: '🎯',
    })
    setIsCreating(false)
    setEditingId(null)
    setShowEmojiPicker(null)
  }

  const isFormValid = () => {
    if (!formData.title.trim()) return false
    if (formData.type === 'measurable') {
      if (!formData.target || parseFloat(formData.target) <= 0) return false
      if (!formData.unit.trim()) return false
    }
    return true
  }

  const handleCreate = async () => {
    if (!isFormValid()) return

    try {
      await addGoal({
        title: formData.title,
        type: formData.type,
        target: formData.type === 'measurable' ? parseFloat(formData.target) : undefined,
        unit: formData.type === 'measurable' ? formData.unit : undefined,
        icon: formData.icon,
      })
      resetForm()
    } catch (error) {
      // Error is already handled in the store
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setFormData({
      title: goal.title,
      type: goal.type,
      target: goal.target?.toString() || '',
      unit: goal.unit || '',
      icon: goal.icon || '🎯',
    })
  }

  const handleUpdate = async () => {
    if (!editingId || !isFormValid()) return

    try {
      await updateGoal(editingId, {
        title: formData.title,
        type: formData.type,
        target: formData.type === 'measurable' ? parseFloat(formData.target) : undefined,
        unit: formData.type === 'measurable' ? formData.unit : undefined,
        icon: formData.icon,
      })
      resetForm()
    } catch (error) {
      // Error is already handled in the store
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setFormData({ ...formData, icon: emojiData.emoji })
    setShowEmojiPicker(null)
  }

  const handleDeleteClick = (goal: Goal) => {
    setGoalToDelete(goal)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (goalToDelete) {
      try {
        await deleteGoal(goalToDelete.id)
        setDeleteDialogOpen(false)
        setGoalToDelete(null)
      } catch (error) {
        // Error is already handled in the store
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setGoalToDelete(null)
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Settings className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Manage Goals</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create, edit, and delete your weekly goals
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!isCreating && !editingId && (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Goal
            </Button>
          )}

          {isCreating && (
            <GoalForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={resetForm}
              submitLabel="Create"
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              handleEmojiClick={handleEmojiClick}
              isValid={isFormValid()}
            />
          )}

          {loading && !isCreating && !editingId && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && goals.map((goal) => (
            <div key={goal.id}>
              {editingId === goal.id ? (
                <GoalForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleUpdate}
                  onCancel={resetForm}
                  submitLabel="Update"
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  handleEmojiClick={handleEmojiClick}
                  isValid={isFormValid()}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.type === 'measurable'
                            ? `Target: ${goal.target} ${goal.unit}`
                            : 'Yes/No goal'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(goal)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}

          {!loading && goals.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No goals yet. Click "Add New Goal" to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{goalToDelete?.title}</strong>?
            This action cannot be undone and all progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDeleteCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
