import { ref } from 'vue'

const isFullscreen = ref(false)

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

export function useFullscreen() {
  function toggle() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }

  return { isFullscreen, toggle }
}
