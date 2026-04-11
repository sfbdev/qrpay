<template>
  <div class="screen">
    <div class="illustration">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <!-- Table shape -->
        <rect x="20" y="50" width="80" height="8" rx="4" fill="var(--surface-2)"/>
        <rect x="30" y="58" width="4" height="30" rx="2" fill="var(--border-strong)"/>
        <rect x="86" y="58" width="4" height="30" rx="2" fill="var(--border-strong)"/>
        <!-- Lock circle -->
        <circle cx="60" cy="38" r="24" fill="var(--primary-subtle)" stroke="var(--primary)" stroke-width="2"/>
        <rect x="52" y="36" width="16" height="12" rx="2" fill="none" stroke="var(--primary)" stroke-width="2"/>
        <path d="M56 36V32a4 4 0 018 0v4" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="60" cy="42" r="1.5" fill="var(--primary)"/>
      </svg>
    </div>
    <h2>{{ t.title }}</h2>
    <p>{{ t.desc }}</p>
    <div class="hint-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </svg>
      <span>{{ lang === 'tr' ? 'Garsonunuzu çağırın' : 'Call your waiter' }}</span>
    </div>
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 16px;
  text-align: center;
  animation: fade-in 0.4s ease;
}

.illustration {
  margin-bottom: 8px;
}

h2 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

p {
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.6;
  max-width: 280px;
}

.hint-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 14px 20px;
  background: var(--primary-subtle);
  border: 1px solid var(--primary-subtle-border);
  border-radius: var(--radius);
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
}
</style>
