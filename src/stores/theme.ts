import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const darkMode = ref(getInitialColorMode())

  // Actions
  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', JSON.stringify(darkMode.value))
  }

  function getInitialColorMode(): boolean {
    // Check for dark mode preference in localStorage
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      return JSON.parse(savedMode)
    }
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true
    }
    
    return false
  }

  return {
    darkMode,
    toggleDarkMode
  }
})