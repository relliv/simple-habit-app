<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHabitStore } from '../stores/habits'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'vue-chartjs'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  habits: Array<{
    id: string
    name: string
    category: string
    color: string
  }>
}>()

const habitStore = useHabitStore()

// Compute completion rates for all habits
const completionRates = computed(() => {
  return props.habits.map(habit => ({
    id: habit.id,
    name: habit.name,
    category: habit.category,
    color: habit.color,
    completionRate: habitStore.getCompletionRate(habit.id)
  }))
})

// Sort habits by completion rate
const sortedHabits = computed(() => {
  return [...completionRates.value].sort((a, b) => b.completionRate - a.completionRate)
})

// Chart data
const chartData = computed(() => {
  return {
    labels: sortedHabits.value.map(h => h.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: sortedHabits.value.map(h => h.completionRate),
        backgroundColor: sortedHabits.value.map(h => h.color),
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 40
      }
    ]
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value: number) => `${value}%`,
        color: 'rgb(156, 163, 175)' // text-gray-400
      },
      grid: {
        color: 'rgb(55, 65, 81)' // dark:border-dark-600
      }
    },
    x: {
      ticks: {
        color: 'rgb(156, 163, 175)' // text-gray-400
      },
      grid: {
        color: 'rgb(55, 65, 81)' // dark:border-dark-600
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `Completion rate: ${context.raw.toFixed(1)}%`
      },
      backgroundColor: 'rgb(31, 41, 55)', // dark:bg-dark-700
      titleColor: 'rgb(229, 231, 235)', // dark:text-dark-100
      bodyColor: 'rgb(156, 163, 175)' // dark:text-dark-300
    }
  }
}

// Calculate overall completion rate
const overallCompletionRate = computed(() => {
  if (completionRates.value.length === 0) return 0
  
  const sum = completionRates.value.reduce((acc, habit) => acc + habit.completionRate, 0)
  return Math.round(sum / completionRates.value.length)
})

// Group habits by category
const habitsByCategory = computed(() => {
  const categories: Record<string, number> = {}
  
  completionRates.value.forEach(habit => {
    if (!categories[habit.category]) {
      categories[habit.category] = 0
    }
    categories[habit.category]++
  })
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    count
  }))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Overall Stats -->
    <div class="card p-6 bg-white dark:bg-dark-700">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-100">Overall Completion Rate</h2>
      
      <div class="flex items-center space-x-4">
        <div class="w-24 h-24 relative flex items-center justify-center">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <!-- Background circle -->
            <circle cx="18" cy="18" r="15.91549430918954" fill="none" stroke="#e5e7eb" stroke-width="3" class="dark:stroke-dark-600"></circle>
            
            <!-- Progress circle -->
            <circle 
              cx="18" 
              cy="18" 
              r="15.91549430918954" 
              fill="none" 
              :stroke="overallCompletionRate >= 75 ? '#22C55E' : overallCompletionRate >= 50 ? '#F59E0B' : '#EF4444'" 
              stroke-width="3"
              stroke-dasharray="100"
              :stroke-dashoffset="100 - overallCompletionRate"
              stroke-linecap="round"
              transform="rotate(-90 18 18)"
            ></circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-bold text-gray-900 dark:text-dark-100">{{ overallCompletionRate }}%</span>
          </div>
        </div>
        
        <div class="flex-1">
          <p class="text-gray-600 dark:text-dark-300">
            <span v-if="overallCompletionRate >= 75">
              Excellent work! You're consistently completing your habits.
            </span>
            <span v-else-if="overallCompletionRate >= 50">
              Good progress. Keep working on consistency to improve further.
            </span>
            <span v-else-if="overallCompletionRate > 0">
              You're making a start. Try to increase your consistency.
            </span>
            <span v-else>
              Start tracking your habits to see your progress.
            </span>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Habits Completion Chart -->
    <div class="card p-6 bg-white dark:bg-dark-700">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-100">Habit Completion Rates (30 Days)</h2>
      
      <div class="h-[300px]">
        <Bar 
          v-if="props.habits.length > 0"
          :data="chartData" 
          :options="chartOptions"
        />
        <div v-else class="h-full flex items-center justify-center">
          <p class="text-gray-500 dark:text-dark-400">No habit data available yet</p>
        </div>
      </div>
    </div>
    
    <!-- Categories Breakdown -->
    <div class="card p-6 bg-white dark:bg-dark-700">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-100">Categories Breakdown</h2>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div 
          v-for="category in habitsByCategory"
          :key="category.category"
          class="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg text-center"
        >
          <div class="text-2xl font-bold text-gray-900 dark:text-dark-100">{{ category.count }}</div>
          <div class="text-gray-600 dark:text-dark-300 capitalize">{{ category.category }}</div>
        </div>
      </div>
    </div>
  </div>
</template>