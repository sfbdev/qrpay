<template>
  <div class="screen">
    <div class="icon">✅</div>
    <h2>{{ t.title }}</h2>
    <p>{{ t.desc }}</p>

    <div class="card receipt">
      <div class="receipt-row" v-for="item in items" :key="item.id">
        <span>{{ item.name }}</span>
        <span>{{ formatPrice(item.price) }}</span>
      </div>
      <div class="receipt-divider"></div>
      <div class="receipt-row total">
        <span>{{ t.total }}</span>
        <strong>{{ formatPrice(total) }}</strong>
      </div>
      <div class="receipt-no">{{ t.receiptNo }}: {{ receiptNo }}</div>
    </div>

    <p class="brand-note">{{ t.thanksNote }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const lang = localStorage.getItem('qrpay_lang') || 'tr'
const i18n = {
  tr: { title: 'Teşekkürler!', desc: 'Ödemeniz alındı. İyi günler!', total: 'Toplam', receiptNo: 'Fiş No', thanksNote: 'Tekrar görüşmek üzere 👋' },
  en: { title: 'Thank You!', desc: 'Payment received. Have a great day!', total: 'Total', receiptNo: 'Receipt', thanksNote: 'See you next time 👋' },
}
const t = computed(() => i18n[lang] || i18n.tr)

// Mock — gerçekte route state veya API'dan gelecek
const items = [
  { id: 1, name: 'Margherita Pizza', price: 280 },
  { id: 4, name: 'Efes Bira', price: 90 },
]
const total = computed(() => items.reduce((s, i) => s + i.price, 0))
const receiptNo = '20260414-0001'

function formatPrice(val) {
  return '₺' + val.toLocaleString('tr-TR')
}
</script>

<style scoped>
.screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px; gap: 20px; text-align: center;
}
.icon { font-size: 72px; }
h2 { font-size: 26px; font-weight: 800; }
p { color: var(--muted); font-size: 15px; }

.receipt { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.receipt-row { display: flex; justify-content: space-between; font-size: 14px; }
.receipt-row.total { font-size: 16px; font-weight: 700; color: var(--text); }
.receipt-divider { border-top: 1px dashed var(--border); }
.receipt-no { font-size: 12px; color: var(--muted); text-align: center; margin-top: 4px; }
.brand-note { font-size: 16px; color: var(--text); }
</style>
