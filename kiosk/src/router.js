import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Tables from './views/Tables.vue'
import Orders from './views/Orders.vue'
import Cashier from './views/Cashier.vue'
import Menu from './views/Menu.vue'
import Staff from './views/Staff.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/app',
    component: () => import('./components/layout/AppShell.vue'),
    children: [
      { path: '', redirect: '/app/dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'tables', component: Tables },
      { path: 'orders', component: Orders },
      { path: 'cashier', component: Cashier },
      { path: 'menu', component: Menu },
      { path: 'staff', component: Staff },
      { path: 'settings', component: Settings },
    ]
  }
]

export default createRouter({ history: createWebHistory(), routes })
