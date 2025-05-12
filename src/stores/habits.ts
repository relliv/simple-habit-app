import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, isToday, parseISO, subDays, isWithinInterval, addDays } from 'date-fns'

interface Habit {
  id: string
  name: string
  description: string
  category: string
  frequency: 'daily' | 'weekly' | 'custom'
  frequencyDays?: number[]
  createdAt: string
  color: string
  dailyGoal: number
  points: number
}

interface HabitCompletion {
  habitId: string
  date: string
  completed: boolean
  count: number
}

export const useHabitStore = defineStore('habits', () => {
  // State
  const habits = ref<Habit[]>(loadFromStorage('habits', []))
  const completions = ref<HabitCompletion[]>(loadFromStorage('completions', []))

  // Computed
  const todaysHabits = computed(() => {
    return habits.value.filter(habit => {
      // For daily habits, always return
      if (habit.frequency === 'daily') return true
      
      // For weekly habits, check if today is in the frequencyDays
      if (habit.frequency === 'custom' && habit.frequencyDays) {
        const today = new Date().getDay() // 0 is Sunday, 1 is Monday, etc.
        return habit.frequencyDays.includes(today)
      }
      
      return true
    })
  })

  const habitsByCategory = computed(() => {
    const categories: Record<string, Habit[]> = {}
    
    habits.value.forEach(habit => {
      if (!categories[habit.category]) {
        categories[habit.category] = []
      }
      categories[habit.category].push(habit)
    })
    
    return categories
  })

  // Actions
  function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>) {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    
    habits.value.push(newHabit)
    saveToStorage('habits', habits.value)
    return newHabit
  }

  function updateHabit(habitId: string, updates: Partial<Habit>) {
    const index = habits.value.findIndex(h => h.id === habitId)
    if (index !== -1) {
      habits.value[index] = { ...habits.value[index], ...updates }
      saveToStorage('habits', habits.value)
      return habits.value[index]
    }
    return null
  }

  function deleteHabit(habitId: string) {
    habits.value = habits.value.filter(h => h.id !== habitId)
    completions.value = completions.value.filter(c => c.habitId !== habitId)
    saveToStorage('habits', habits.value)
    saveToStorage('completions', completions.value)
  }

  function toggleCompletion(habitId: string, date: Date = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const existingIndex = completions.value.findIndex(
      c => c.habitId === habitId && c.date === dateStr
    )
    
    const habit = getHabitById(habitId)
    if (!habit) return

    if (existingIndex !== -1) {
      const completion = completions.value[existingIndex]
      if (completion.completed) {
        // If already completed, increment count up to goal
        if (completion.count < habit.dailyGoal) {
          completion.count++
        }
        // If reached goal, mark as not completed and reset count
        if (completion.count >= habit.dailyGoal) {
          completion.completed = false
          completion.count = 0
        }
      } else {
        // If not completed, mark as completed and set count to 1
        completion.completed = true
        completion.count = 1
      }
    } else {
      // Create new completion
      completions.value.push({
        habitId,
        date: dateStr,
        completed: true,
        count: 1
      })
    }
    
    saveToStorage('completions', completions.value)
  }

  function getCompletionStatus(habitId: string, date: Date = new Date()): boolean {
    const dateStr = format(date, 'yyyy-MM-dd')
    const completion = completions.value.find(
      c => c.habitId === habitId && c.date === dateStr
    )
    return completion ? completion.completed : false
  }

  function getCompletionCount(habitId: string, date: Date = new Date()): number {
    const dateStr = format(date, 'yyyy-MM-dd')
    const completion = completions.value.find(
      c => c.habitId === habitId && c.date === dateStr
    )
    return completion ? completion.count : 0
  }

  function getHabitById(habitId: string): Habit | undefined {
    return habits.value.find(h => h.id === habitId)
  }

  function getStreakCount(habitId: string): number {
    let streak = 0
    let currentDate = new Date()
    
    while (getCompletionStatus(habitId, currentDate)) {
      streak++
      currentDate = subDays(currentDate, 1)
    }
    
    return streak
  }

  function getCompletionRate(habitId: string, days: number = 30): number {
    const today = new Date()
    const startDate = subDays(today, days)
    
    let totalDays = 0
    let completedDays = 0
    
    // Create a date range to check
    for (let i = 0; i < days; i++) {
      const checkDate = subDays(today, i)
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      
      // Find if the habit was completed on this date
      const completed = completions.value.find(
        c => c.habitId === habitId && c.date === dateStr && c.completed
      )
      
      if (completed) {
        completedDays++
      }
      
      totalDays++
    }
    
    return totalDays > 0 ? (completedDays / totalDays) * 100 : 0
  }

  // Helper functions
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  function loadFromStorage<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  }

  function saveToStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  return {
    habits,
    completions,
    todaysHabits,
    habitsByCategory,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getCompletionStatus,
    getCompletionCount,
    getHabitById,
    getStreakCount,
    getCompletionRate
  }
})