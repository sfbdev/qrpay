<template>
  <div>
    <div class="topbar">
      <span class="topbar-title">Aktif Siparişler</span>
    </div>

    <div class="orders-list">
      <div v-for="o in orders" :key="o.id" :class="['order-card card', o.status === 'Yeni' && 'new']">
        <div class="order-head">
          <span class="table-tag">Masa {{ o.table }}</span>
          <span :class="['badge', badge(o.status)]">{{ o.status }}</span>
          <span class="order-time">{{ o.time }}</span>
        </div>
        <div class="order-name">{{ o.name }}</div>
        <div v-if="o.note" class="order-note">📝 {{ o.note }}</div>

        <div class="order-actions" v-if="o.status === 'Hazırlanıyor'">
          <button class="btn btn-outline btn-sm" @click="deliver(o)">✓ Teslim Edildi</button>
        </div>
      </div>

      <div v-if="orders.length === 0" class="empty">Aktif sipariş yok 🎉</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  { id: 1, table: 3, name: 'Cola', time: '8 dk', status: 'Hazırlanıyor', note: '' },
  { id: 2, table: 7, name: 'Su x2', time: '3 dk', status: 'Hazırlanıyor', note: '' },
  { id: 3, table: 9, name: 'Efes Bira x3', time: '1 dk', status: 'Yeni', note: '' },
  { id: 4, table: 12, name: 'Margherita Pizza', time: '1 dk', status: 'Yeni', note: 'az pişmiş' },
])

function badge(s) {
  return { 'Yeni': 'badge-red', 'Hazırlanıyor': 'badge-yellow' }[s] || 'badge-gray'
}
function deliver(o) {
  orders.value = orders.value.filter(x => x.id !== o.id)
}
</script>

<style scoped>
.orders-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }

.order-card { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.order-card.new { border-left: 4px solid var(--primary); }

.order-head { display: flex; align-items: center; gap: 8px; }
.table-tag {
  background: var(--text); color: #fff;
  padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;
}
.order-time { margin-left: auto; font-size: 12px; color: var(--muted); }
.order-name { font-size: 16px; font-weight: 700; }
.order-note { font-size: 13px; color: var(--muted); }
.order-actions { margin-top: 2px; }

.empty { text-align: center; padding: 60px 0; color: var(--muted); font-size: 16px; }
</style>
