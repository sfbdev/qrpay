import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('qrpay-theme') || 'light')

watch(theme, v => {
  document.documentElement.setAttribute('data-theme', v)
  localStorage.setItem('qrpay-theme', v)
}, { immediate: true })

export function useTheme() {
  const toggle = () => theme.value = theme.value === 'light' ? 'dark' : 'light'
  return { theme, toggle }
}
