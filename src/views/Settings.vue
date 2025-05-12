<script setup lang="ts">
import { ref } from 'vue'
import { useHabitStore } from '../stores/habits'
import { useThemeStore } from '../stores/theme'

const habitStore = useHabitStore()
const themeStore = useThemeStore()

// Export data
function exportData() {
  const data = {
    habits: habitStore.habits,
    completions: habitStore.completions
  }
  
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `simple-habit-app-${new Date().toISOString().split('T')[0]}.json`
  link.click()
}

// Import data
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      if (data.habits && data.completions) {
        localStorage.setItem('habits', JSON.stringify(data.habits))
        localStorage.setItem('completions', JSON.stringify(data.completions))
        
        // Reload the page to refresh data from localStorage
        window.location.reload()
      } else {
        alert('Invalid data format')
      }
    } catch (error) {
      alert('Error importing data')
      console.error(error)
    }
  }
  
  reader.readAsText(file)
}

// Reset data
function resetData() {
  if (confirm('Are you sure you want to reset all habits and completion data? This cannot be undone.')) {
    localStorage.removeItem('habits')
    localStorage.removeItem('completions')
    
    // Reload the page to refresh data from localStorage
    window.location.reload()
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-dark-100">Settings</h1>
      <p class="text-gray-600 dark:text-dark-300">Customize your habit tracking experience</p>
    </div>
    
    <div class="card p-6 space-y-6">
      <!-- Theme -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">Appearance</h2>
        <div class="flex items-center justify-between">
          <span class="text-gray-700 dark:text-dark-200">Dark Mode</span>
          <button 
            @click="themeStore.toggleDarkMode" 
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="themeStore.darkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-dark-600'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="themeStore.darkMode ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
      </div>
      
      <!-- Data Management -->
      <div class="pt-4 border-t border-gray-200 dark:border-dark-600">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">Data Management</h2>
        
        <div class="space-y-4">
          <!-- Export Data -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-dark-100">Export Data</h3>
              <p class="text-sm text-gray-600 dark:text-dark-300">Download all habit data as JSON</p>
            </div>
            <button @click="exportData" class="btn btn-outline text-gray-700 dark:text-dark-200">Export</button>
          </div>
          
          <!-- Import Data -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-dark-100">Import Data</h3>
              <p class="text-sm text-gray-600 dark:text-dark-300">Upload a previously exported file</p>
            </div>
            <div>
              <input 
                ref="fileInput"
                type="file" 
                accept=".json" 
                @change="handleFileUpload"
                class="hidden"
              >
              <button @click="triggerFileInput" class="btn btn-outline text-gray-700 dark:text-dark-200">Import</button>
            </div>
          </div>
          
          <!-- Reset Data -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
            <div>
              <h3 class="font-medium text-error-500">Reset All Data</h3>
              <p class="text-sm text-gray-600 dark:text-dark-300">Permanently delete all habits and completion data</p>
            </div>
            <button @click="resetData" class="btn btn-outline text-error-500">Reset</button>
          </div>
        </div>
      </div>
      
      <!-- About -->
      <div class="pt-4 border-t border-gray-200 dark:border-dark-600">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">About</h2>
        <p class="text-sm text-gray-600 dark:text-dark-300">Simple Habit App - Habit Tracker</p>
        <p class="text-sm text-gray-600 dark:text-dark-300">Version 0.1.0</p>
      </div>
    </div>
  </div>
</template>