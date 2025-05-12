<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHabitStore } from '../stores/habits'
import HabitCard from '../components/HabitCard.vue'
import HabitStats from '../components/HabitStats.vue'
import { format } from 'date-fns'

const habitStore = useHabitStore()
const selectedTab = ref('today')

const today = format(new Date(), 'EEEE, MMMM d')

const allHabits = computed(() => habitStore.habits)
const todaysHabits = computed(() => habitStore.todaysHabits)

const completedHabits = computed(() => {
  return todaysHabits.value.filter(habit => 
    habitStore.getCompletionStatus(habit.id)
  )
})

const completionPercentage = computed(() => {
  if (todaysHabits.value.length === 0) return 0
  return Math.round((completedHabits.value.length / todaysHabits.value.length) * 100)
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-100">Dashboard</h1>
      <p class="text-gray-600 dark:text-dark-300">{{ today }}</p>
    </div>

    <!-- Today's summary -->
    <div class="card p-6 space-y-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-dark-100">Today's Progress</h2>
      
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <div class="flex-1">
          <div class="relative h-4 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-500 ease-out" 
              :style="{ width: `${completionPercentage}%` }"
            ></div>
          </div>
        </div>
        <div class="text-right">
          <span class="text-2xl font-bold text-primary-500">{{ completedHabits.length }}/{{ todaysHabits.length }}</span>
          <span class="text-gray-600 dark:text-dark-300 ml-1">completed</span>
        </div>
      </div>
      
      <div v-if="todaysHabits.length === 0" class="text-center py-6">
        <p class="text-gray-500 dark:text-dark-300">No habits scheduled for today.</p>
        <router-link to="/habit/new" class="btn btn-primary mt-4 inline-block">
          Create Your First Habit
        </router-link>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-dark-600">
      <div class="flex space-x-8">
        <button 
          @click="selectedTab = 'today'" 
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="selectedTab === 'today' 
            ? 'border-primary-500 text-primary-500' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-200'"
        >
          Today's Habits
        </button>
        <button 
          @click="selectedTab = 'all'" 
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="selectedTab === 'all' 
            ? 'border-primary-500 text-primary-500' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-200'"
        >
          All Habits
        </button>
        <button 
          @click="selectedTab = 'stats'" 
          class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="selectedTab === 'stats' 
            ? 'border-primary-500 text-primary-500' 
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-200'"
        >
          Statistics
        </button>
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="space-y-4">
      <!-- Today's Habits -->
      <div v-if="selectedTab === 'today'">
        <div v-if="todaysHabits.length > 0" class="grid gap-4 sm:grid-cols-2">
          <habit-card 
            v-for="habit in todaysHabits" 
            :key="habit.id" 
            :habit="habit"
          />
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-dark-300 mb-4">You don't have any habits scheduled for today.</p>
          <router-link to="/habit/new" class="btn btn-primary">
            Create a New Habit
          </router-link>
        </div>
      </div>

      <!-- All Habits -->
      <div v-if="selectedTab === 'all'">
        <div v-if="allHabits.length > 0" class="grid gap-4 sm:grid-cols-2">
          <habit-card 
            v-for="habit in allHabits" 
            :key="habit.id" 
            :habit="habit"
          />
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-dark-300 mb-4">You haven't created any habits yet.</p>
          <router-link to="/habit/new" class="btn btn-primary">
            Create Your First Habit
          </router-link>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="selectedTab === 'stats'">
        <div v-if="allHabits.length > 0">
          <habit-stats :habits="allHabits" />
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-dark-300 mb-4">You need to create habits before seeing statistics.</p>
          <router-link to="/habit/new" class="btn btn-primary">
            Create Your First Habit
          </router-link>
        </div>
      </div>
    </div>

    <!-- Floating Action Button (mobile only) -->
    <div class="fixed bottom-6 right-6 lg:hidden">
      <router-link to="/habit/new" class="btn btn-primary flex items-center justify-center rounded-full w-14 h-14 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </router-link>
    </div>
  </div>
</template>