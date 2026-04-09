<template>
  <div>
    <div class="topbar">
      <span class="topbar-title">Masalar</span>
      <span class="waiter-name">👤 Mehmet</span>
    </div>

    <!-- Status filter -->
    <div class="filter-bar">
      <button
        v-for="f in filters" :key="f.value"
        :class="['filter-btn', activeFilter === f.value && 'active']"
        @click="activeFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <div class="tables-grid">
      <RouterLink
        v-for="t in filteredTables" :key="t.id"
        :to="`/app/tables/${t.id}`"
        :class="['table-card card', t.status]"
      >
        <div class="card-top">
          <span class="table-num">{{ t.number }}</span>
          <span :class="['badge', statusBadge(t.status)]">{{ statusLabel(t.status) }}</span>
        </div>
        <div class="table-cap">{{ t.capacity }} kişilik</div>
        <div v-if="t.status !== 'empty'" class="table-bottom">
          <span>👥 {{ t.guests }}</span>
          <span class="table-time">{{ t.openedAt }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const filters = [
  { label: 'Tümü', value: 'all' },
  { label: 'Açık', value: 'open' },
  { label: 'Boş', value: 'empty' },
  { label: 'Ödeme', value: 'payment' },
]

const tables = ref([
  { id: 1, number: 1, capacity: 4, status: 'empty', guests: 0, openedAt: '' },
  { id: 2, number: 2, capacity: 2, status: 'empty', guests: 0, openedAt: '' },
  { id: 3, number: 3, capacity: 4, status: 'open', guests: 4, openedAt: '19:32' },
  { id: 4, number: 4, capacity: 6, status: 'empty', guests: 0, openedAt: '' },
  { id: 5, number: 5, capacity: 2, status: 'open', guests: 2, openedAt: '20:05' },
  { id: 6, number: 6, capacity: 4, status: 'empty', guests: 0, openedAt: '' },
  { id: 7, number: 7, capacity: 8, status: 'payment', guests: 6, openedAt: '18:55' },
  { id: 8, number: 8, capacity: 4, status: 'empty', guests: 0, openedAt: '' },
  { id: 9, number: 9, capacity: 4, status: 'open', guests: 3, openedAt: '20:18' },
  { id: 10, number: 10, capacity: 2, status: 'empty', guests: 0, openedAt: '' },
  { id: 11, number: 11, capacity: 4, status: 'empty', guests: 0, openedAt: '' },
  { id: 12, number: 12, capacity: 6, status: 'open', guests: 5, openedAt: '19:44' },
])

const filteredTables = computed(() =>
  activeFilter.value === 'all' ? tables.value : tables.value.filter(t => t.status === activeFilter.value)
)

function statusLabel(s) {
  return { empty: 'Boş', open: 'Açık', payment: 'Ödeme' }[s] || s
}
function statusBadge(s) {
  return { empty: 'badge-gray', open: 'badge-green', payment: 'badge-yellow' }[s] || 'badge-gray'
}
</script>

<style scoped>
.waiter-name { font-size: 13px; color: var(--muted); font-weight: 600; }

.filter-bar {
  display: flex; gap: 8px; padding: 12px 16px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.filter-bar::-webkit-scrollbar { display: none; }
.filter-btn {
  padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;
  border: 2px solid var(--border); background: transparent; color: var(--muted);
  cursor: pointer; white-space: nowrap; transition: all .15s;
}
.filter-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }

.tables-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; padding: 4px 16px 16px;
}

.table-card {
  padding: 14px; display: flex; flex-direction: column; gap: 6px;
  text-decoration: none; color: inherit;
  border: 2px solid transparent; transition: border-color .15s;
}
.table-card:active { opacity: .8; }
.table-card.payment { border-color: #F59E0B; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.table-num { font-size: 26px; font-weight: 800; line-height: 1; }
.table-cap { font-size: 11px; color: var(--muted); }
.table-bottom { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-top: 4px; }
.table-time { font-weight: 600; }
</style>
