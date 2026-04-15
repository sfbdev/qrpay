<template>
  <div class="page">
    <div class="page-header">
      <div>
        <p class="header-date">{{ today }}</p>
        <h1>Merhaba, {{ userName }}</h1>
      </div>
    </div>

    <div class="page-body">
      <div class="stats-grid">
        <div v-for="(s, i) in stats" :key="s.label" class="stat-card card" :style="{ animationDelay: i * 80 + 'ms' }">
          <div class="stat-top">
            <div :class="['stat-icon-box', s.color]">
              <svg v-if="s.color === 'icon-indigo'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 6h14"/><path d="M3 10h18"/><path d="M5 18h14"/></svg>
              <svg v-else-if="s.color === 'icon-amber'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              <svg v-else-if="s.color === 'icon-emerald'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div v-if="s.trend" :class="['trend-badge', s.trend.up ? 'trend-up' : 'trend-down']">
              <svg v-if="s.trend.up" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
              {{ s.trend.up ? '+' : '' }}{{ s.trend.value }}
            </div>
          </div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-footer">
            <span class="stat-label">{{ s.label }}</span>
            <span v-if="s.trend" class="trend-period">{{ s.trend.period }}</span>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="card section-card">
          <div class="section-header">
            <h3>Active Tables</h3>
            <RouterLink to="/app/tables" class="btn btn-ghost btn-sm">View All</RouterLink>
          </div>
          <div class="table-list">
            <div v-if="!activeTables.length" class="empty-state">Açık masa yok</div>
            <div v-for="t in activeTables" :key="t.id" class="table-row">
              <div class="table-row-left">
                <div class="table-num-badge">{{ t.number }}</div>
                <div class="table-row-info">
                  <div class="table-row-top">
                    <span class="table-name">{{ t.label }}</span>
                    <span :class="['badge', statusBadge(t.status)]">{{ statusLabel(t.status) }}</span>
                  </div>
                  <div class="table-row-meta">{{ t.guestName || 'Misafir' }}{{ t.guestCount ? ' · ' + t.guestCount + ' kişi' : '' }}</div>
                </div>
              </div>
              <div class="table-total">₺{{ t.total.toLocaleString('tr-TR') }}</div>
            </div>
          </div>
        </div>

        <div class="card section-card">
          <div class="section-header">
            <h3>Recent Orders</h3>
            <RouterLink to="/app/orders" class="btn btn-ghost btn-sm">View All</RouterLink>
          </div>
          <div class="order-list">
            <div v-if="!recentOrders.length" class="empty-state">Bugün sipariş yok</div>
            <div v-for="o in recentOrders" :key="o.id" class="order-row">
              <div class="order-left">
                <div class="order-dot-wrap">
                  <span :class="['order-dot', 'dot-' + orderDotColor(o.status)]"></span>
                </div>
                <div class="order-info">
                  <div class="order-item">{{ o.item }}</div>
                  <div class="order-meta">{{ o.tableLabel }} · {{ timeAgo(o.createdAt) }}</div>
                </div>
              </div>
              <span :class="['badge', orderBadge(o.status)]">{{ orderBadgeLabel(o.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '../composables/useApi.js'

const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
const userName = JSON.parse(localStorage.getItem('qrpay_kiosk_user') || '{}')?.name || 'Admin'

const data = ref(null)
const loading = ref(true)
let refreshInterval = null

async function fetchDashboard() {
  try {
    data.value = await api('/api/dashboard')
  } catch (e) {
    console.error('Dashboard fetch error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
  refreshInterval = setInterval(fetchDashboard, 15000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

const stats = computed(() => {
  const s = data.value?.stats
  if (!s) return []
  return [
    {
      value: `${s.occupiedTables} / ${s.totalTables}`,
      label: 'Dolu Masa',
      color: 'icon-indigo',
      trend: null,
    },
    {
      value: String(s.activeOrders),
      label: 'Aktif Sipariş',
      color: 'icon-amber',
      trend: null,
    },
    {
      value: '₺' + s.dailyRevenue.toLocaleString('tr-TR'),
      label: 'Günlük Ciro',
      color: 'icon-emerald',
      trend: null,
    },
    {
      value: String(s.totalGuests),
      label: 'Misafir',
      color: 'icon-violet',
      trend: null,
    },
  ]
})

const activeTables = computed(() => data.value?.activeTables || [])
const recentOrders = computed(() => data.value?.recentOrders || [])

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}sn önce`
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`
  return `${Math.floor(diff / 3600)}sa önce`
}

function statusBadge(s) {
  if (s === 'WAITING') return 'badge-yellow'
  if (s === 'OPEN') return 'badge-green'
  return 'badge-gray'
}
function statusLabel(s) {
  if (s === 'WAITING') return 'Bekliyor'
  return 'Açık'
}
function orderBadge(s) {
  if (s === 'PENDING_APPROVAL') return 'badge-red'
  if (s === 'APPROVED') return 'badge-yellow'
  return 'badge-gray'
}
function orderBadgeLabel(s) {
  if (s === 'PENDING_APPROVAL') return 'Onay Bekliyor'
  if (s === 'APPROVED') return 'Hazırlanıyor'
  if (s === 'SERVED') return 'Servis Edildi'
  if (s === 'CANCELLED') return 'İptal'
  return s
}
function orderDotColor(s) {
  if (s === 'PENDING_APPROVAL') return 'red'
  if (s === 'APPROVED') return 'amber'
  return 'gray'
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  padding: 32px 40px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-date {
  font-size: 12px;
  color: var(--text-3);
  margin-bottom: 4px;
  text-transform: capitalize;
  font-weight: 500;
  letter-spacing: 0.02em;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.page-body {
  padding: 28px 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  flex: 1;
  overflow-y: auto;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slide-up 0.4s ease both;
  cursor: default;
  transition: border-color var(--transition);
}

.stat-card:hover {
  border-color: var(--border-strong);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-box.icon-indigo { background: var(--info-bg); color: var(--info-text); }
.stat-icon-box.icon-amber { background: var(--warning-bg); color: var(--warning-text); }
.stat-icon-box.icon-emerald { background: var(--success-bg); color: var(--success-text); }
.stat-icon-box.icon-violet { background: var(--purple-bg); color: var(--purple-text); }

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.trend-badge.trend-up {
  background: var(--success-bg);
  color: var(--success-text);
}

.trend-badge.trend-down {
  background: var(--danger-bg);
  color: var(--danger-text);
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 500;
}

.trend-period {
  font-size: 11px;
  color: var(--text-3);
}

/* Bottom grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

/* Table rows */
.table-list,
.order-list {
  display: flex;
  flex-direction: column;
}

.table-row,
.order-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: background var(--transition);
}

.table-row:hover,
.order-row:hover {
  background: var(--surface-2);
}

.table-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.table-num-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-1);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.table-row-info {
  flex: 1;
  min-width: 0;
}

.table-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-1);
  white-space: nowrap;
}

.table-row-meta {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 3px;
}

.table-total {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-1);
  flex-shrink: 0;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* Orders */
.order-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.order-dot-wrap {
  width: 8px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.order-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-red { background: var(--danger-text); }
.dot-amber { background: var(--warning-text); }
.dot-gray { background: var(--text-3); }

.empty-state {
  font-size: 13px;
  color: var(--text-3);
  padding: 12px;
  text-align: center;
}

.order-info {
  flex: 1;
}

.order-item {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-1);
}

.order-meta {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
</style>
