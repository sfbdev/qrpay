<template>
  <div class="screen">
    <div class="top">
      <div class="lock-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h2>{{ t.title }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>

    <div :class="['pin-boxes', shake && 'shake']" @animationend="shake = false">
      <div
        v-for="i in 4"
        :key="i"
        :class="['pin-box', digits.length >= i && 'filled', digits.length === i - 1 && 'active']"
      >
        <span v-if="digits.length >= i" class="pin-dot"></span>
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ t.wrongPin }}</p>
    <p v-if="loading" class="loading-msg">{{ t.verifying }}</p>

    <div class="numpad">
      <button
        v-for="n in [1,2,3,4,5,6,7,8,9]"
        :key="n"
        class="numpad-key"
        :disabled="loading"
        @click="press(n)"
      >{{ n }}</button>
      <div class="numpad-key numpad-empty"></div>
      <button class="numpad-key" :disabled="loading" @click="press(0)">0</button>
      <button class="numpad-key numpad-del" :disabled="loading" @click="del">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
          <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const router = useRouter()
const route = useRoute()
const lang = localStorage.getItem('qrpay_lang') || 'tr'

const digits = ref([])
const error = ref(false)
const shake = ref(false)
const loading = ref(false)

const i18n = {
  tr: {
    title: 'Masa PIN\'i',
    subtitle: 'Garsondan aldığınız 4 haneli kodu girin.',
    wrongPin: 'Hatalı PIN. Lütfen tekrar deneyin.',
    verifying: 'Doğrulanıyor...',
  },
  en: {
    title: 'Table PIN',
    subtitle: 'Enter the 4-digit code from your waiter.',
    wrongPin: 'Incorrect PIN. Please try again.',
    verifying: 'Verifying...',
  },
}

const t = computed(() => i18n[lang] || i18n.tr)

function press(digit) {
  if (digits.value.length >= 4 || loading.value) return
  error.value = false
  digits.value = [...digits.value, digit]
  if (digits.value.length === 4) {
    setTimeout(verifyPin, 150)
  }
}

function del() {
  if (loading.value) return
  if (digits.value.length > 0) {
    digits.value = digits.value.slice(0, -1)
    error.value = false
  }
}

async function verifyPin() {
  const pin = digits.value.join('')
  const { tenant, tableId } = route.params

  loading.value = true
  error.value = false

  try {
    const res = await fetch(
      `${API_BASE}/api/sessions/verify?tableId=${encodeURIComponent(tableId)}&pin=${encodeURIComponent(pin)}`
    )

    if (!res.ok) {
      error.value = true
      shake.value = true
      digits.value = []
      return
    }

    const data = await res.json()
    localStorage.setItem('qrpay_session', JSON.stringify(data))
    router.push(`/r/${tenant}/t/${tableId}/bill`)
  } catch {
    error.value = true
    shake.value = true
    digits.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px 32px;
  gap: 28px;
  animation: slide-up 0.4s ease;
}

.top {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lock-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--primary-subtle);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top h2 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

.top p {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.5;
}

/* PIN boxes */
.pin-boxes {
  display: flex;
  gap: 12px;
}

.pin-box {
  width: 64px;
  height: 72px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}

.pin-box.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
}

.pin-box.filled {
  border-color: var(--primary);
  background: var(--primary-subtle);
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--primary);
  animation: fade-in 0.15s ease;
}

/* Shake animation */
.shake { animation: shake .35s ease; }

.error-msg {
  font-size: 13px;
  color: var(--danger-text);
  font-weight: 600;
  background: var(--danger-bg);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--danger-border);
}

/* Numpad */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 288px;
  margin-top: auto;
}

.numpad-key {
  height: 64px;
  border: none;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1.5px solid var(--border);
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition), transform var(--transition);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.numpad-key:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.numpad-key:active {
  background: var(--primary-subtle);
  transform: scale(0.95);
}

.numpad-empty {
  background: transparent;
  border-color: transparent;
  pointer-events: none;
}

.numpad-del {
  color: var(--text-2);
}

.loading-msg {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 600;
}
</style>
