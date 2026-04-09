import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Tables from './views/Tables.vue'
import TableDetail from './views/TableDetail.vue'
import NewOrder from './views/NewOrder.vue'
import OrdersActive from './views/OrdersActive.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/app',
    component: () => import('./components/AppShell.vue'),
    children: [
      { path: '', redirect: '/app/tables' },
      { path: 'tables', component: Tables },
      { path: 'tables/:id', component: TableDetail },
      { path: 'tables/:id/order', component: NewOrder },
      { path: 'orders', component: OrdersActive },
    ]
  }
]

export default createRouter({ history: createWebHistory(), routes })
