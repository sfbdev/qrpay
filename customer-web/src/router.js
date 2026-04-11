import { createRouter, createWebHistory } from 'vue-router'
import LanguageSelect from './views/LanguageSelect.vue'
import NameEntry from './views/NameEntry.vue'
import PinEntry from './views/PinEntry.vue'
import TableView from './views/TableView.vue'
import NoSession from './views/NoSession.vue'
import ThankYou from './views/ThankYou.vue'

const routes = [
  { path: '/', redirect: '/r/freya-cafe/t/5' },
  { path: '/r/:tenant/t/:tableId', component: LanguageSelect },
  { path: '/r/:tenant/t/:tableId/join', component: NameEntry },
  { path: '/r/:tenant/t/:tableId/pin', component: PinEntry },
  { path: '/r/:tenant/t/:tableId/bill', component: TableView },
  { path: '/r/:tenant/t/:tableId/closed', component: ThankYou },
  { path: '/no-session', component: NoSession },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
