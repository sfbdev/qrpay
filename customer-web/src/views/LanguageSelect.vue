<template>
  <div class="screen">
    <div class="brand">
      <div class="logo-box">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2h18v20H3z" opacity="0"/>
          <path d="M18 8h1a4 4 0 010 8h-1"/>
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      </div>
      <h1 class="brand-name">Freya Cafe</h1>
      <div class="table-badge">Masa {{ $route.params.tableId }}</div>
    </div>

    <div class="lang-buttons">
      <button
        :class="['lang-card', selected === 'tr' && 'active']"
        @click="selected = 'tr'"
      >
        <span class="flag">🇹🇷</span>
        <div class="lang-info">
          <span class="lang-name">Türkçe</span>
          <span class="lang-sub">Türkçe olarak devam et</span>
        </div>
        <div class="radio-dot">
          <div v-if="selected === 'tr'" class="radio-inner"></div>
        </div>
      </button>
      <button
        :class="['lang-card', selected === 'en' && 'active']"
        @click="selected = 'en'"
      >
        <span class="flag">🇬🇧</span>
        <div class="lang-info">
          <span class="lang-name">English</span>
          <span class="lang-sub">Continue in English</span>
        </div>
        <div class="radio-dot">
          <div v-if="selected === 'en'" class="radio-inner"></div>
        </div>
      </button>
    </div>

    <button class="btn btn-primary continue-btn" @click="select(selected)">
      {{ selected === 'tr' ? 'Devam Et' : 'Continue' }}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const selected = ref('tr')

onMounted(() => {
  if (!localStorage.getItem('qrpay_lang')) {
    localStorage.setItem('qrpay_lang', 'en')
    router.replace(`/r/${route.params.tenant}/t/${route.params.tableId}/join`)
  }
})

function select(lang) {
  localStorage.setItem('qrpay_lang', lang)
  router.push(`/r/${route.params.tenant}/t/${route.params.tableId}/join`)
}
</script>

<style scoped>
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 32px;
  gap: 40px;
  animation: fade-in 0.4s ease;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: var(--primary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-glow 2.5s ease-in-out infinite;
}

.brand-name {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.table-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
}

.lang-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.lang-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-1);
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  font-family: inherit;
}

.lang-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

.lang-card.active {
  border-color: var(--primary);
  background: var(--primary-subtle);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
}

.flag {
  font-size: 32px;
  line-height: 1;
}

.lang-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lang-name {
  font-size: 16px;
  font-weight: 700;
}

.lang-sub {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 400;
}

.radio-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color var(--transition);
}

.lang-card.active .radio-dot {
  border-color: var(--primary);
}

.radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  animation: fade-in 0.15s ease;
}

.continue-btn {
  margin-top: auto;
}
</style>
