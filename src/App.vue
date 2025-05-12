<script setup lang="ts">
import { watch } from 'vue'
import { useThemeStore } from './stores/theme'
import MainLayout from './layouts/MainLayout.vue'

// Initialize theme
const themeStore = useThemeStore()

// Apply theme on component mount and when it changes
watch(
  () => themeStore.darkMode,
  (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)
</script>

<template>
  <main-layout>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main-layout>
</template>