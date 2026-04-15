<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>{{ t.ordersTitle }}</h1>
        <p class="page-subtitle">{{ t.ordersSubtitle }}</p>
      </div>
      <div class="filter-group">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="['filter-btn', activeFilter === f.value && 'active']"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span v-if="f.count" class="filter-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <div class="page-body">
      <TransitionGroup name="order-list" tag="div" class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          :class="['order-card card', 'status-' + indicatorColor(order.status), order.justApproved && 'approved-flash']"
        >
          <!-- Top row: table + item + status -->
          <div class="card-top">
            <div class="card-table-badge">{{ order.table }}</div>
            <div class="card-main">
              <div class="card-item">{{ order.item }}</div>
              <div class="card-meta">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>{{ order.guest }}</span>
                <span class="sep">·</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{{ order.time }}</span>
              </div>
            </div>
            <span :class="['status-badge', 'status-badge-' + indicatorColor(order.status)]">
              <span class="status-dot"></span>{{ order.status }}
            </span>
          </div>

          <!-- Note -->
          <div v-if="order.note" class="card-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {{ order.note }}
          </div>

          <!-- Actions -->
          <div v-if="order.status === 'New'" class="card-actions">
            <button class="action-approve" @click="approve(order)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ t.approve }}
            </button>
            <button class="action-reject" @click="reject(order)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              {{ t.reject }}
            </button>
          </div>
          <div v-else-if="order.status === 'Preparing'" class="card-actions">
            <button class="action-deliver" @click="deliver(order)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              {{ t.markDelivered }}
            </button>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        </div>
        <p class="empty-title">{{ t.noOrdersFound }}</p>
        <p class="empty-desc">{{ t.noOrdersHint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api, getTenantSlug } from '../composables/useApi.js'
import { t } from '../composables/useLang.js'
import { toastSuccess, toastError, toastWarning } from '../composables/useToast.js'

const activeFilter = ref('all')
const error = ref('')
const loading = ref(false)

const orders = ref([])

const filters = computed(() => {
  const newCount = orders.value.filter(o => o.status === 'New').length
  return [
    { label: t.value.filterAll, value: 'all' },
    { label: t.value.filterNew, value: 'New', count: newCount || undefined },
    { label: t.value.filterPreparing, value: 'Preparing' },
    { label: t.value.filterDelivered, value: 'Delivered' },
  ]
})

function mapStatus(s) {
  const map = {
    PENDING_APPROVAL: 'New',
    APPROVED: 'Preparing',
    PREPARING: 'Preparing',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  }
  return map[s] || s
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff === 1) return '1 min ago'
  return `${diff} min ago`
}

function mapOrder(o) {
  const itemSummary = o.items?.map(i => {
    const prefix = i.quantity > 1 ? `${i.quantity}x ` : ''
    return prefix + i.name
  }).join(', ') || ''

  return {
    id: o.id,
    table: o.tableNumber || o.session?.tableNumber || '?',
    item: itemSummary,
    guest: o.guestName || o.session?.guestName || '',
    time: timeAgo(o.createdAt),
    status: mapStatus(o.status),
    note: o.note || '',
    justApproved: false,
  }
}

async function fetchOrders() {
  try {
    const data = await api('/api/orders')
    orders.value = data.map(mapOrder)
  } catch (e) {
    error.value = e.message
  }
}

const filteredOrders = computed(() =>
  activeFilter.value === 'all' ? orders.value : orders.value.filter(o => o.status === activeFilter.value)
)

function indicatorColor(s) {
  return { New: 'red', 'Preparing': 'amber', 'Delivered': 'gray', 'Cancelled': 'gray' }[s] || 'gray'
}

async function approve(o) {
  o.justApproved = true
  try {
    await api(`/api/orders/${o.id}/approve`, { method: 'PUT' })
    setTimeout(() => {
      o.status = 'Preparing'
      o.justApproved = false
    }, 500)
  } catch (e) {
    o.justApproved = false
    error.value = e.message
  }
}

async function reject(o) {
  try {
    await api(`/api/orders/${o.id}/cancel`, { method: 'PUT' })
    orders.value = orders.value.filter(x => x.id !== o.id)
    toastWarning(t.value.reject)
  } catch (e) {
    error.value = e.message
    toastError(e.message)
  }
}

function deliver(o) {
  o.status = 'Delivered'
}

// Polling for new orders every 10 seconds
let pollInterval = null
onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(fetchOrders, 10000)
})
onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
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
  align-items: flex-start;
  justify-content: space-between;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 4px;
}

/* Filter pills */
.filter-group {
  display: flex;
  gap: 4px;
  background: var(--surface-2);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-2);
  transition: all var(--transition);
  position: relative;
}

.filter-btn:hover {
  color: var(--text-1);
}

.filter-btn.active {
  background: var(--surface);
  color: var(--text-1);
  box-shadow: var(--shadow-sm);
}

.filter-count {
  background: var(--primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow-y: auto;
}

/* Order cards */
.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.order-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition);
  border-left: 3px solid transparent;
}

.order-card:hover {
  border-color: var(--border-strong);
}

.order-card.status-red   { border-left-color: var(--danger-text); }
.order-card.status-amber { border-left-color: var(--warning-text); }
.order-card.status-gray  { border-left-color: var(--border-strong); }

.order-card.approved-flash {
  border-left-color: var(--success-text);
  background: var(--success-bg);
}

/* Card top row */
.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.card-table-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-1);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.card-item {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-3);
}

.card-meta svg { flex-shrink: 0; }

.sep { color: var(--border-strong); }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge-red    { background: var(--danger-bg);  color: var(--danger-text); }
.status-badge-red .status-dot { background: var(--danger-text); }
.status-badge-amber { background: var(--warning-bg); color: var(--warning-text); }
.status-badge-amber .status-dot { background: var(--warning-text); }
.status-badge-gray   { background: var(--surface-2);  color: var(--text-3); }
.status-badge-gray .status-dot { background: var(--text-3); }

/* Note */
.card-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 20px 16px;
  padding: 10px 12px;
  background: var(--warning-bg);
  color: var(--warning-text);
  font-size: 12px;
  font-weight: 500;
  border-radius: 10px;
  border: 1px solid var(--warning-border);
}

.card-note svg { flex-shrink: 0; }

/* Actions */
.card-actions {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.card-actions button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px 12px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}

.action-approve {
  background: var(--success-bg);
  color: var(--success-text);
  border-right: 1px solid var(--border) !important;
}
.action-approve:active { filter: brightness(0.95); }

.action-reject {
  background: var(--surface);
  color: var(--text-2);
}
.action-reject:active { background: var(--danger-bg); color: var(--danger-text); }

.action-deliver {
  background: var(--info-bg);
  color: var(--info-text);
}
.action-deliver:active { filter: brightness(0.95); }

/* List transition */
.order-list-enter-active {
  transition: all var(--transition-slow);
}
.order-list-leave-active {
  transition: all var(--transition);
}
.order-list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.order-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.order-list-move {
  transition: transform var(--transition-slow);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 80px;
  color: var(--text-3);
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  margin-bottom: 4px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
}

.empty-desc {
  font-size: 13px;
  color: var(--text-3);
}
</style>
