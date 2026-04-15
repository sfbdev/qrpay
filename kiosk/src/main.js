import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import './style.scss'
import './toast.scss'

createApp(App)
  .use(router)
  .use(Vue3Toastify, { clearOnUrlChange: false })
  .mount('#app')
