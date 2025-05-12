<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHabitStore } from '../stores/habits'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)
const currentDate = ref(new Date())

// Calendar navigation
function previousMonth() {
  currentDate.value = subMonths(currentDate.value, 1)
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1)
}

function goToToday() {
  currentDate.value = new Date()
}

// Calendar data
const monthStart = computed(() => startOfMonth(currentDate.value))
const monthEnd = computed(() => endOfMonth(currentDate.value))
const monthDays = computed(() => 
  eachDayOfInterval({ start: monthStart.value, end: monthEnd.value })
)

const calendarDays = computed(() => {
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.value.getDay()
  
  // Create an array of days including those from the previous month to fill the calendar
  const days = []
  
  // Add blank cells for days from previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add days from current month
  monthDays.value.forEach(day => {
    days.push(day)
  })
  
  return days
})

// Get habits completed on a specific day
function getHabitsForDay(day: Date) {
  if (!day) return []
  
  return habits.value.filter(habit => {
    return habitStore.getCompletionStatus(habit.id, day)
  })
}

// Format month and year
const currentMonthYear = computed(() => 
  format(currentDate.value, 'MMMM yyyy')
)

// Day names for calendar header
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Check if a day is today
function isToday(day: Date | null) {
  if (!day) return false
  return isSameDay(day, new Date())
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-100">Calendar</h1>
      <p class="text-gray-600 dark:text-dark-300">Track your habit completion over time</p>
    </div>
    
    <div class="card p-6">
      <!-- Calendar navigation -->
      <div class="flex items-center justify-between mb-6">
        <button @click="previousMonth" class="btn btn-outline p-2 text-gray-700 dark:text-dark-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="flex items-center space-x-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-dark-100">{{ currentMonthYear }}</h2>
          <button @click="goToToday" class="btn btn-outline text-sm py-1 text-gray-700 dark:text-dark-200">Today</button>
        </div>
        
        <button @click="nextMonth" class="btn btn-outline p-2 text-gray-700 dark:text-dark-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Calendar -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Day names -->
        <div 
          v-for="dayName in dayNames" 
          :key="dayName"
          class="text-center font-medium text-gray-500 dark:text-dark-300 text-sm py-2"
        >
          {{ dayName }}
        </div>
        
        <!-- Calendar days -->
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="min-h-[80px] border border-gray-200 dark:border-dark-600 rounded-md p-1 transition-colors"
          :class="[
            day ? 'bg-white dark:bg-dark-700' : 'bg-gray-50 dark:bg-dark-800',
            isToday(day) ? 'ring-2 ring-primary-500' : ''
          ]"
        >
          <!-- Day number -->
          <div v-if="day" class="text-right text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
            {{ format(day, 'd') }}
          </div>
          
          <!-- Habits completed on this day -->
          <div v-if="day" class="flex flex-col gap-1">
            <div 
              v-for="habit in getHabitsForDay(day)" 
              :key="habit.id"
              class="text-xs py-1 px-2 rounded-md overflow-hidden text-ellipsis whitespace-nowrap text-white"
              :style="{ backgroundColor: habit.color }"
              :title="habit.name"
            >
              {{ habit.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>