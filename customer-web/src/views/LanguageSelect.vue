<template>
  <div class="screen">
    <div class="brand">
      <div class="logo-box">
        <span class="logo-icon">🍽️</span>
      </div>
      <h1>Freya Cafe</h1>
      <p class="table-label">Masa {{ $route.params.tableId }}</p>
    </div>

    <div class="lang-buttons">
      <button class="lang-btn" @click="select('tr')">
        <span class="flag">🇹🇷</span>
        <span>Türkçe</span>
      </button>
      <button class="lang-btn" @click="select('en')">
        <span class="flag">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
  padding: 32px 24px;
  gap: 48px;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: var(--primary);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.table-label {
  font-size: 14px;
  color: var(--muted);
  background: var(--border);
  padding: 4px 12px;
  border-radius: 20px;
}

.lang-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color .15s;
  color: var(--text);
}
.lang-btn:hover { border-color: var(--primary); }

.flag { font-size: 28px; }
</style>
