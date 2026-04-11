<template>
  <div class="screen">
    <div class="top">
      <div class="icon-box">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h2>{{ t.welcome }}</h2>
      <p class="subtitle">{{ t.subtitle }}</p>
    </div>

    <div class="form-area">
      <label>{{ t.nameLabel }}</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <input
          v-model="name"
          :placeholder="t.namePlaceholder"
          maxlength="30"
          @keyup.enter="join"
          autofocus
        />
      </div>
    </div>

    <div class="bottom">
      <button class="btn btn-primary" :disabled="!name.trim()" @click="join">
        {{ t.joinBtn }}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const name = ref('')
const lang = localStorage.getItem('qrpay_lang') || 'tr'

const i18n = {
  tr: {
    welcome: 'Hoş geldiniz!',
    subtitle: 'Masaya katılmak için adınızı girin.',
    nameLabel: 'Adınız',
    namePlaceholder: 'ör. Ahmet',
    joinBtn: 'Masaya Katıl',
  },
  en: {
    welcome: 'Welcome!',
    subtitle: 'Enter your name to join the table.',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. John',
    joinBtn: 'Join Table',
  },
}

const t = computed(() => i18n[lang] || i18n.tr)

function join() {
  if (!name.value.trim()) return
  localStorage.setItem('qrpay_name', name.value.trim())
  router.push(`/r/${route.params.tenant}/t/${route.params.tableId}/pin`)
}
</script>

<style scoped>
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 24px 32px;
  gap: 32px;
  animation: slide-up 0.4s ease;
}

.top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  background: var(--primary-subtle);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.top h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  color: var(--text-2);
  line-height: 1.5;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-area label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-3);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  height: 52px;
  padding: 0 16px 0 44px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-1);
  background: var(--surface);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.input-wrapper input::placeholder {
  color: var(--text-3);
  font-weight: 400;
}

.input-wrapper input:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.bottom {
  margin-top: auto;
}
</style>
