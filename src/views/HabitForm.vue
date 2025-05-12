<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHabitStore } from '../stores/habits'

const router = useRouter()
const route = useRoute()
const habitStore = useHabitStore()

const habitId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!habitId.value)

const name = ref('')
const description = ref('')
const category = ref('general')
const frequency = ref('daily')
const frequencyDays = ref<number[]>([])
const color = ref('#0D9488') // Default to primary color
const dailyGoal = ref(1)
const points = ref(1)

// Day names for custom frequency
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Available categories
const categories = [
  { id: 'health', name: 'Health' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'learning', name: 'Learning' },
  { id: 'finance', name: 'Finance' },
  { id: 'social', name: 'Social' },
  { id: 'general', name: 'General' }
]

// Available colors
const colors = [
  { id: '#0D9488', name: 'Teal' },
  { id: '#4F46E5', name: 'Indigo' },
  { id: '#F59E0B', name: 'Amber' },
  { id: '#EF4444', name: 'Red' },
  { id: '#22C55E', name: 'Green' },
  { id: '#8B5CF6', name: 'Purple' },
  { id: '#EC4899', name: 'Pink' }
]

// Load habit data if editing
onMounted(() => {
  if (habitId.value) {
    const habit = habitStore.getHabitById(habitId.value)
    if (habit) {
      name.value = habit.name
      description.value = habit.description
      category.value = habit.category
      frequency.value = habit.frequency
      frequencyDays.value = habit.frequencyDays || []
      color.value = habit.color
      dailyGoal.value = habit.dailyGoal
      points.value = habit.points
    } else {
      // Handle invalid habit ID
      router.push('/')
    }
  }
})

// Form handling
const errors = ref<Record<string, string>>({})

function validateForm(): boolean {
  errors.value = {}
  
  if (!name.value.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (frequency.value === 'custom' && frequencyDays.value.length === 0) {
    errors.value.frequencyDays = 'Select at least one day'
  }

  if (dailyGoal.value < 1) {
    errors.value.dailyGoal = 'Daily goal must be at least 1'
  }

  if (points.value < 1) {
    errors.value.points = 'Points must be at least 1'
  }
  
  return Object.keys(errors.value).length === 0
}

function toggleDay(day: number) {
  const index = frequencyDays.value.indexOf(day)
  if (index === -1) {
    frequencyDays.value.push(day)
  } else {
    frequencyDays.value.splice(index, 1)
  }
}

function saveHabit() {
  if (!validateForm()) return
  
  const habitData = {
    name: name.value,
    description: description.value,
    category: category.value,
    frequency: frequency.value as 'daily' | 'weekly' | 'custom',
    color: color.value,
    dailyGoal: dailyGoal.value,
    points: points.value
  }
  
  if (frequency.value === 'custom') {
    Object.assign(habitData, { frequencyDays: frequencyDays.value })
  }
  
  if (isEditing.value) {
    habitStore.updateHabit(habitId.value!, habitData)
  } else {
    habitStore.addHabit(habitData)
  }
  
  router.push('/')
}

function cancel() {
  router.push('/')
}

function deleteHabit() {
  if (isEditing.value && confirm('Are you sure you want to delete this habit?')) {
    habitStore.deleteHabit(habitId.value!)
    router.push('/')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-100">
        {{ isEditing ? 'Edit Habit' : 'Create Habit' }}
      </h1>
      <button v-if="isEditing" @click="deleteHabit" class="btn btn-outline text-error-500">
        Delete
      </button>
    </div>
    
    <div class="card p-6">
      <form @submit.prevent="saveHabit" class="space-y-6">
        <!-- Name -->
        <div>
          <label for="name" class="label">Habit Name</label>
          <input 
            id="name" 
            v-model="name" 
            type="text" 
            class="input" 
            placeholder="What habit would you like to track?"
            :class="{ 'border-error-500': errors.name }"
          >
          <p v-if="errors.name" class="mt-1 text-sm text-error-500">{{ errors.name }}</p>
        </div>
        
        <!-- Description -->
        <div>
          <label for="description" class="label">Description (Optional)</label>
          <textarea 
            id="description" 
            v-model="description" 
            class="input" 
            rows="3" 
            placeholder="Describe your habit or add notes"
          ></textarea>
        </div>
        
        <!-- Category -->
        <div>
          <label for="category" class="label">Category</label>
          <select id="category" v-model="category" class="input">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        
        <!-- Daily Goal -->
        <div>
          <label for="dailyGoal" class="label">Daily Goal (times per day)</label>
          <input 
            id="dailyGoal" 
            v-model.number="dailyGoal" 
            type="number" 
            min="1" 
            class="input" 
            :class="{ 'border-error-500': errors.dailyGoal }"
          >
          <p v-if="errors.dailyGoal" class="mt-1 text-sm text-error-500">{{ errors.dailyGoal }}</p>
        </div>

        <!-- Points -->
        <div>
          <label for="points" class="label">Points per completion</label>
          <input 
            id="points" 
            v-model.number="points" 
            type="number" 
            min="1" 
            class="input" 
            :class="{ 'border-error-500': errors.points }"
          >
          <p v-if="errors.points" class="mt-1 text-sm text-error-500">{{ errors.points }}</p>
        </div>
        
        <!-- Color -->
        <div>
          <label class="label">Color</label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="col in colors" 
              :key="col.id" 
              type="button"
              @click="color = col.id"
              class="w-8 h-8 rounded-full border-2 transition-all duration-200"
              :style="{ backgroundColor: col.id }"
              :class="color === col.id ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'"
            ></button>
          </div>
        </div>
        
        <!-- Frequency -->
        <div>
          <label class="label">Frequency</label>
          <div class="space-y-3">
            <div class="flex items-center">
              <input 
                id="daily" 
                type="radio" 
                v-model="frequency" 
                value="daily"
                class="h-4 w-4 text-primary-500"
              >
              <label for="daily" class="ml-3 block text-gray-700 dark:text-dark-200">Every day</label>
            </div>
            
            <div class="flex items-center">
              <input 
                id="weekly" 
                type="radio" 
                v-model="frequency" 
                value="weekly"
                class="h-4 w-4 text-primary-500"
              >
              <label for="weekly" class="ml-3 block text-gray-700 dark:text-dark-200">Weekly</label>
            </div>
            
            <div>
              <div class="flex items-center">
                <input 
                  id="custom" 
                  type="radio" 
                  v-model="frequency" 
                  value="custom"
                  class="h-4 w-4 text-primary-500"
                >
                <label for="custom" class="ml-3 block text-gray-700 dark:text-dark-200">Specific days</label>
              </div>
              
              <div 
                v-if="frequency === 'custom'"
                class="mt-3 ml-7 grid grid-cols-2 sm:grid-cols-4 gap-2"
                :class="{ 'border-error-500': errors.frequencyDays }"
              >
                <div 
                  v-for="(day, index) in dayNames" 
                  :key="index"
                  @click="toggleDay(index)"
                  class="cursor-pointer px-3 py-2 rounded-md text-center text-sm font-medium transition-colors"
                  :class="frequencyDays.includes(index) 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-500'"
                >
                  {{ day.substring(0, 3) }}
                </div>
              </div>
              <p v-if="errors.frequencyDays" class="mt-1 ml-7 text-sm text-error-500">{{ errors.frequencyDays }}</p>
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="cancel" class="btn btn-outline">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Update Habit' : 'Create Habit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>