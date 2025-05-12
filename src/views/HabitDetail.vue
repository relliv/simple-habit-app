<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHabitStore } from '../stores/habits'
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'

const route = useRoute()
const router = useRouter()
const habitStore = useHabitStore()

const habitId = computed(() => route.params.id as string)
const habit = computed(() => habitStore.getHabitById(habitId.value))

// Redirect if habit not found
if (!habit.value) {
  router.push('/')
}

// Calculate streak
const streak = computed(() => habitStore.getStreakCount(habitId.value))

// Calculate completion rate
const completionRate = computed(() => 
  Math.round(habitStore.getCompletionRate(habitId.value))
)

// Get completion count for today
const todayCompletionCount = computed(() => 
  habitStore.getCompletionCount(habitId.value)
)

// Get history for the last 30 days
const historyDays = 30
const today = new Date()
const startDate = subDays(today, historyDays - 1)

const dateRange = eachDayOfInterval({ start: startDate, end: today })
const history = computed(() => 
  dateRange.map(date => ({
    date,
    dateStr: format(date, 'yyyy-MM-dd'),
    formattedDate: format(date, 'MMM d'),
    isCompleted: habitStore.getCompletionStatus(habitId.value, date),
    count: habitStore.getCompletionCount(habitId.value, date)
  }))
)

// Functions
function toggleCompletion(date: Date) {
  habitStore.toggleCompletion(habitId.value, date)
}

function editHabit() {
  router.push(`/habit/${habitId.value}/edit`)
}

function deleteHabit() {
  if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
    habitStore.deleteHabit(habitId.value)
    router.push('/')
  }
}
</script>

<template>
  <div v-if="habit" class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ habit.name }}</h1>
        <p class="text-gray-600 dark:text-gray-400">{{ habit.description }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="editHabit" class="btn btn-primary">
          Edit Habit
        </button>
        <button @click="deleteHabit" class="btn btn-outline text-error-500">
          Delete
        </button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Current Streak -->
      <div class="card p-6 flex flex-col items-center justify-center bg-white dark:bg-dark-700">
        <div class="text-gray-600 dark:text-gray-400 text-sm">Current Streak</div>
        <div class="flex items-baseline mt-1">
          <span class="text-3xl font-bold text-primary-500">{{ streak }}</span>
          <span class="ml-1 text-gray-600 dark:text-gray-400">days</span>
        </div>
      </div>
      
      <!-- Daily Progress -->
      <div class="card p-6 flex flex-col items-center justify-center bg-white dark:bg-dark-700">
        <div class="text-gray-600 dark:text-gray-400 text-sm">Today's Progress</div>
        <div class="flex items-baseline mt-1">
          <span class="text-3xl font-bold text-accent-400">{{ todayCompletionCount }}/{{ habit.dailyGoal }}</span>
          <span class="ml-1 text-gray-600 dark:text-gray-400">times</span>
        </div>
      </div>
      
      <!-- Points -->
      <div class="card p-6 flex flex-col items-center justify-center bg-white dark:bg-dark-700">
        <div class="text-gray-600 dark:text-gray-400 text-sm">Points per Completion</div>
        <div class="flex items-baseline mt-1">
          <span class="text-3xl font-bold text-secondary-500">{{ habit.points }}</span>
          <span class="ml-1 text-gray-600 dark:text-gray-400">points</span>
        </div>
      </div>
      
      <!-- Completion Rate -->
      <div class="card p-6 flex flex-col items-center justify-center bg-white dark:bg-dark-700">
        <div class="text-gray-600 dark:text-gray-400 text-sm">30-Day Completion</div>
        <div class="flex items-baseline mt-1">
          <span class="text-3xl font-bold" :class="
            completionRate >= 80 ? 'text-success-500' : 
            completionRate >= 50 ? 'text-accent-400' : 
            'text-error-500'
          ">{{ completionRate }}%</span>
        </div>
      </div>
    </div>
    
    <!-- History Calendar -->
    <div class="card p-6 bg-white dark:bg-dark-700">
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Activity History</h2>
      
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="day in history" 
          :key="day.dateStr"
          @click="toggleCompletion(day.date)"
          class="cursor-pointer aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200 hover:scale-105"
          :class="[
            day.isCompleted ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700',
          ]"
        >
          <span class="text-xs">{{ day.formattedDate.split(' ')[0] }}</span>
          <span class="text-lg font-bold">{{ day.formattedDate.split(' ')[1] }}</span>
          <span v-if="day.count > 0" class="text-xs mt-1">{{ day.count }}/{{ habit.dailyGoal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>