<template>
  <div class="screen">
    <div class="success-anim">
      <svg class="checkmark-svg" width="80" height="80" viewBox="0 0 80 80">
        <circle class="checkmark-circle" cx="40" cy="40" r="36" fill="none" stroke="var(--primary)" stroke-width="3"/>
        <path class="checkmark-check" d="M24 42l10 10 22-24" fill="none" stroke="var(--primary)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <h2>{{ t.title }}</h2>
    <p class="desc">{{ t.desc }}</p>

    <div class="card receipt">
      <div class="receipt-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>{{ t.receiptNo }}: {{ receiptNo }}</span>
      </div>
      <div class="receipt-items">
        <div class="receipt-row" v-for="item in items" :key="item.id">
          <span class="receipt-name">{{ item.name }}</span>
          <span class="receipt-price">{{ formatPrice(item.price) }}</span>
        </div>
      </div>
      <div class="receipt-divider"></div>
      <div class="receipt-row total-row">
        <span>{{ t.total }}</span>
        <strong>{{ formatPrice(total) }}</strong>
      </div>
    </div>

    <p class="brand-note">{{ t.thanksNote }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const lang = localStorage.getItem('qrpay_lang') || 'tr'
const i18n = {
  tr: { title: 'Teşekkürler!', desc: 'Ödemeniz alındı. İyi günler!', total: 'Toplam', receiptNo: 'Fiş No', thanksNote: 'Tekrar görüşmek üzere' },
  en: { title: 'Thank You!', desc: 'Payment received. Have a great day!', total: 'Total', receiptNo: 'Receipt', thanksNote: 'See you next time' },
}
const t = computed(() => i18n[lang] || i18n.tr)

// Mock
const items = [
  { id: 1, name: 'Margherita Pizza', price: 280 },
  { id: 4, name: 'Efes Bira', price: 90 },
]
const total = computed(() => items.reduce((s, i) => s + i.price, 0))
const receiptNo = '20260414-0001'

function formatPrice(val) {
  return '\u20BA' + val.toLocaleString('tr-TR')
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
  gap: 20px;
  text-align: center;
  animation: fade-in 0.5s ease;
}

/* Checkmark animation */
.success-anim {
  margin-bottom: 4px;
}

.checkmark-svg {
  overflow: visible;
}

.checkmark-circle {
  animation: checkmark-circle 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: center;
}

.checkmark-check {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: checkmark-draw 0.4s 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.desc {
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.5;
}

.receipt {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.receipt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--surface-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.receipt-items {
  display: flex;
  flex-direction: column;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-1);
}

.receipt-name {
  font-weight: 500;
}

.receipt-price {
  font-weight: 600;
  color: var(--text-2);
}

.receipt-divider {
  border-top: 1px dashed var(--border);
  margin: 0 16px;
}

.total-row {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  padding: 14px 16px;
}

.total-row strong {
  color: var(--primary);
  font-size: 18px;
}

.brand-note {
  font-size: 15px;
  color: var(--text-2);
  margin-top: 8px;
}
</style>
