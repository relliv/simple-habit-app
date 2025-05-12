<script setup lang="ts">
import { computed } from 'vue'
import { useHabitStore } from '../stores/habits'
import { useRouter } from 'vue-router'

const props = defineProps<{
  habit: {
    id: string
    name: string
    description: string
    category: string
    frequency: string
    color: string
    dailyGoal: number
    points: number
  }
}>()

const habitStore = useHabitStore()
const router = useRouter()

const isCompleted = computed(() => 
  habitStore.getCompletionStatus(props.habit.id)
)

const completionCount = computed(() =>
  habitStore.getCompletionCount(props.habit.id)
)

const streak = computed(() => 
  habitStore.getStreakCount(props.habit.id)
)

function toggleCompletion() {
  habitStore.toggleCompletion(props.habit.id)
}

function viewDetails() {
  router.push(`/habit/${props.habit.id}`)
}
</script>

<template>
  <div 
    class="card hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-dark-700"
    :class="isCompleted ? 'border-2 border-primary-500' : ''"
  >
    <div class="relative p-5">
      <!-- Category tag -->
      <div 
        class="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-medium rounded-full text-white"
        :style="{ backgroundColor: habit.color }"
      >
        {{ habit.category }}
      </div>
      
      <div class="flex items-start">
        <!-- Plus button -->
        <button 
          @click="toggleCompletion"
          class="flex-shrink-0 w-8 h-8 rounded-full cursor-pointer mr-3 transition-colors duration-200 flex items-center justify-center"
          :class="isCompleted 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <!-- Habit details -->
        <div class="flex-1 min-w-0" @click="viewDetails">
          <h3 class="text-lg font-semibold mb-1 truncate text-gray-900 dark:text-dark-100">{{ habit.name }}</h3>
          <p v-if="habit.description" class="text-gray-600 dark:text-dark-300 text-sm line-clamp-2">
            {{ habit.description }}
          </p>
          
          <!-- Progress -->
          <div class="mt-2 flex items-center space-x-4">
            <!-- Completion count -->
            <div class="text-sm text-gray-600 dark:text-dark-300">
              {{ completionCount }}/{{ habit.dailyGoal }} times
            </div>
            
            <!-- Points -->
            <div class="text-sm text-accent-400">
              {{ habit.points }} points
            </div>
          </div>
          
          <!-- Streak -->
          <div v-if="streak > 0" class="mt-2 flex items-center text-accent-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span class="text-sm font-medium">{{ streak }} day streak</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>