import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import routes from './router'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create pinia store
const pinia = createPinia()

// Create the app
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app')