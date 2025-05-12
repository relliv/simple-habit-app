import { RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import HabitDetail from '../views/HabitDetail.vue'
import HabitForm from '../views/HabitForm.vue'
import Calendar from '../views/Calendar.vue'
import Settings from '../views/Settings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/habit/:id',
    name: 'habitDetail',
    component: HabitDetail,
    props: true
  },
  {
    path: '/habit/new',
    name: 'newHabit',
    component: HabitForm
  },
  {
    path: '/habit/:id/edit',
    name: 'editHabit',
    component: HabitForm,
    props: true
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  }
]

export default routes