<template>
  <div class="screen">
    <div class="icon">🔒</div>
    <h2>{{ t.title }}</h2>
    <p>{{ t.desc }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const lang = localStorage.getItem('qrpay_lang') || 'tr'
const i18n = {
  tr: { title: 'Masa Kapalı', desc: 'Bu masada henüz aktif bir oturum yok. Lütfen garsonu çağırın, masanızı açsın.' },
  en: { title: 'Table Closed', desc: 'There is no active session for this table yet. Please call a waiter to open your table.' },
}
const t = computed(() => i18n[lang] || i18n.tr)
</script>

<style scoped>
.screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px; gap: 16px; text-align: center;
}
.icon { font-size: 64px; }
h2 { font-size: 22px; font-weight: 700; }
p { color: var(--muted); font-size: 15px; line-height: 1.6; }
</style>
