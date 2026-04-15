<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Tables</h1>
        <p class="page-subtitle">Manage your restaurant floor</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="handleFullscreenBtn" :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'">
          <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
            <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
          </svg>
          {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
        </button>
        <button class="btn btn-primary" @click="showAddTable = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Table
        </button>
      </div>
    </div>

    <div class="page-body">
      <div class="tables-grid">
        <div
          v-for="table in tables"
          :key="table.id"
          :class="[
            'table-card card',
            table.status === 'empty' && 'is-empty',
            table.status === 'payment' && 'is-payment',
          ]"
          @click="selectTable(table)"
        >
          <div class="table-top">
            <span :class="['table-num', table.status === 'empty' && 'num-muted']">
              {{ table.number }}
            </span>
            <span v-if="table.status !== 'empty'" :class="['badge', statusBadge(table.status)]">
              {{ statusLabel(table.status) }}
            </span>
            <span v-else class="empty-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            </span>
          </div>

          <template v-if="table.status !== 'empty'">
            <div class="table-details">
              <div class="detail-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {{ table.guests }}
              </div>
              <span class="detail-sep"></span>
              <div class="detail-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ table.openedAt }}
              </div>
            </div>
            <div class="table-total">{{ table.total.toLocaleString('tr-TR') }} TL</div>
          </template>

          <template v-else>
            <div class="table-empty-text">Available</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Table Detail Panel -->
    <Transition name="modal">
      <div v-if="selected" class="modal-backdrop" @click.self="selected = null">
        <div class="modal card">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="modal-table-badge">
                <span class="modal-table-num">{{ selected.number }}</span>
              </div>
              <div>
                <div class="modal-title">Table {{ selected.number }}</div>
                <div class="modal-subtitle" v-if="selected.status !== 'empty'">
                  <span :class="['badge', statusBadge(selected.status)]">{{ statusLabel(selected.status) }}</span>
                </div>
              </div>
            </div>
            <button class="modal-close" @click="selected = null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="selected.status === 'empty'" class="modal-empty">
            <div class="empty-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <p class="empty-title">Table is available</p>
            <p class="empty-desc">No active session at this table.</p>
            <button class="btn btn-primary open-btn" @click="openTable">Open Table</button>
          </div>

          <!-- Active state -->
          <div v-else class="modal-active">
            <div class="modal-stats">
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <span class="mstat-label">Guests</span>
                <strong class="mstat-value">{{ selected.guests }}</strong>
              </div>
              <div class="mstat-divider"></div>
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span class="mstat-label">Opened</span>
                <strong class="mstat-value">{{ selected.openedAt }}</strong>
              </div>
              <div class="mstat-divider"></div>
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <span class="mstat-label">Total</span>
                <strong class="mstat-value">{{ selected.total.toLocaleString('tr-TR') }} TL</strong>
              </div>
            </div>

            <!-- Session PIN -->
            <div class="session-pin">
              <div class="pin-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Customer PIN
              </div>
              <div class="pin-digits">
                <span v-for="d in selected.pin" :key="d" class="pin-digit">{{ d }}</span>
              </div>
              <div class="pin-hint">Tell this PIN to the customer after they scan the QR.</div>
            </div>

            <div class="action-grid">
              <button class="action-btn" @click="viewOrders">
                <div class="action-icon icon-indigo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                <span class="action-label">Orders</span>
              </button>
              <button class="action-btn" @click="printQR">
                <div class="action-icon icon-violet">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <span class="action-label">Print QR</span>
              </button>
            </div>

            <button class="close-bill-btn" @click="closeTable">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Close Bill
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PIN Modal (fullscreen exit guard) -->
    <Transition name="modal">
      <div v-if="showPin" class="modal-backdrop">
        <div class="pin-modal card">
          <div class="pin-modal-header">
            <div class="pin-lock-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div>
              <div class="pin-modal-title">Enter PIN</div>
              <div class="pin-modal-sub">Enter your PIN to exit fullscreen</div>
            </div>
          </div>

          <div :class="['pin-dots', pinError && 'pin-shake']" @animationend="pinError = false">
            <div v-for="i in 4" :key="i" :class="['pin-dot', pinDigits.length >= i && 'filled']"></div>
          </div>
          <p v-if="pinError" class="pin-error">Incorrect PIN. Try again.</p>

          <div class="numpad">
            <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="numpad-key" @click="numpadPress(n)">{{ n }}</button>
            <button class="numpad-key numpad-cancel" @click="cancelPin">Cancel</button>
            <button class="numpad-key" @click="numpadPress(0)">0</button>
            <button class="numpad-key numpad-del" @click="numpadDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useFullscreen } from '../composables/useFullscreen.js'
import { api, getTenantSlug } from '../composables/useApi.js'

const router = useRouter()
const showAddTable = ref(false)
const selected = ref(null)
const error = ref('')
const loading = ref(false)
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// PIN state
const showPin = ref(false)
const pinDigits = ref([])
const pinError = ref(false)
let pendingRoute = null
let pinAuthorized = false

// If fullscreen is exited without PIN (e.g. Escape key), re-enter it
watch(isFullscreen, (val) => {
  if (!val && !pinAuthorized && !showPin.value) {
    document.documentElement.requestFullscreen().catch(() => {})
  }
  if (!val) pinAuthorized = false
})

function handleFullscreenBtn() {
  if (isFullscreen.value) {
    openPin(null)
  } else {
    toggleFullscreen()
  }
}

const tables = ref([])

function mapTable(t) {
  const activeSession = t.sessions?.find(s => s.status === 'ACTIVE')
  const sessionTotal = activeSession?.orders?.reduce((sum, o) => {
    return sum + (o.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0)
  }, 0) || 0
  const openedAt = activeSession?.createdAt
    ? new Date(activeSession.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  return {
    id: t.id,
    number: t.number,
    label: t.label,
    capacity: t.capacity,
    status: t.status === 'OPEN' ? 'open' : t.status === 'CLOSED' ? 'payment' : 'empty',
    guests: activeSession?.guestCount || 0,
    total: sessionTotal,
    openedAt,
    pin: activeSession?.pin || null,
    sessionId: activeSession?.id || null,
  }
}

async function fetchTables() {
  try {
    const data = await api('/api/tables')
    tables.value = data.map(mapTable)
  } catch (e) {
    error.value = e.message
  }
}

function statusLabel(s) {
  return { empty: 'Empty', open: 'Open', waiting: 'Waiting', payment: 'Payment' }[s] || s
}
function statusBadge(s) {
  return { empty: 'badge-gray', open: 'badge-green', waiting: 'badge-blue', payment: 'badge-yellow' }[s] || 'badge-gray'
}

function selectTable(t) { selected.value = t }

async function openTable() {
  loading.value = true
  try {
    const data = await api(`/api/tables/${selected.value.id}/open`, {
      method: 'POST',
      body: {},
    })
    await fetchTables()
    // Find the updated table to show PIN
    const updated = tables.value.find(t => t.id === selected.value.id)
    if (updated) {
      selected.value = updated
    } else {
      selected.value = null
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function closeTable() {
  loading.value = true
  try {
    await api(`/api/tables/${selected.value.id}/close`, {
      method: 'POST',
    })
    selected.value = null
    await fetchTables()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function viewOrders() {
  router.push('/app/orders')
}
function printQR() {}

// WebSocket
let ws = null
function connectWs() {
  const tenantSlug = getTenantSlug()
  const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
  ws = new WebSocket(`${WS_BASE}/ws?tenantSlug=${tenantSlug}`)
  ws.onmessage = (e) => {
    try {
      const event = JSON.parse(e.data)
      if (['TABLE_OPENED', 'TABLE_CLOSED', 'ORDER_CREATED'].includes(event.type)) {
        fetchTables()
      }
    } catch {
      // ignore malformed messages
    }
  }
  ws.onclose = () => {
    // reconnect after 3 seconds
    setTimeout(() => {
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        connectWs()
      }
    }, 3000)
  }
}

onMounted(() => {
  fetchTables()
  connectWs()
})
onUnmounted(() => {
  ws?.close()
  ws = null
})

// Navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (isFullscreen.value) {
    openPin(to.fullPath)
    next(false)
  } else {
    next()
  }
})

function openPin(route) {
  pendingRoute = route
  pinDigits.value = []
  pinError.value = false
  showPin.value = true
}

// PIN handlers
function numpadPress(digit) {
  if (pinDigits.value.length >= 4) return
  pinDigits.value = [...pinDigits.value, digit]
  if (pinDigits.value.length === 4) {
    setTimeout(confirmPin, 120)
  }
}

function numpadDelete() {
  if (pinDigits.value.length > 0) {
    pinDigits.value = pinDigits.value.slice(0, -1)
  }
  pinError.value = false
}

function confirmPin() {
  const entered = pinDigits.value.join('')
  if (entered === '1234') {
    pinAuthorized = true
    showPin.value = false
    document.exitFullscreen().then(() => {
      if (pendingRoute) router.push(pendingRoute)
    }).catch(() => {
      if (pendingRoute) router.push(pendingRoute)
    })
  } else {
    pinError.value = true
    pinDigits.value = []
  }
}

function cancelPin() {
  showPin.value = false
  pendingRoute = null
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

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow-y: auto;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.table-card {
  padding: 20px;
  cursor: pointer;
  transition: border-color var(--transition), transform var(--transition);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.table-card.is-empty {
  background: var(--surface-2);
  border-color: transparent;
  opacity: 0.7;
}

.table-card.is-empty:hover {
  opacity: 1;
  background: var(--surface);
  border-color: var(--border);
}

.table-card.is-payment {
  border-color: var(--warning-border);
}

.table-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.table-num {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-1);
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.table-num.num-muted {
  color: var(--text-3);
}

.empty-indicator {
  color: var(--text-3);
  opacity: 0.5;
}

.table-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-2);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-3);
}

.table-total {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-1);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.table-empty-text {
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.modal-enter-active { animation: backdrop-in 0.2s ease; }
.modal-leave-active { animation: backdrop-in 0.15s ease reverse; }

.modal {
  width: 420px;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Modal header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-table-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--primary-subtle);
  border: 1px solid var(--primary-subtle-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-table-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  margin-top: 5px;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  flex-shrink: 0;
}

.modal-close:hover {
  background: var(--surface-2);
  color: var(--text-1);
  border-color: var(--border-strong);
}

/* Empty state */
.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 24px 32px;
  text-align: center;
}

.empty-circle {
  width: 60px;
  height: 60px;
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
  margin-bottom: 12px;
}

.open-btn {
  width: 100%;
  padding: 11px;
  font-size: 14px;
}

/* Stats row */
.modal-active {
  display: flex;
  flex-direction: column;
}

.modal-stats {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  gap: 0;
}

.mstat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.mstat-icon {
  color: var(--text-3);
  margin-bottom: 2px;
  display: flex;
}

.mstat-divider {
  width: 1px;
  height: 36px;
  background: var(--border);
  flex-shrink: 0;
}

.mstat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-3);
}

.mstat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

/* Session PIN */
.session-pin {
  background: var(--primary-subtle);
  border: 1px solid var(--primary-subtle-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pin-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.pin-digits {
  display: flex;
  gap: 8px;
}

.pin-digit {
  width: 44px;
  height: 52px;
  background: var(--surface);
  border: 1px solid var(--primary-subtle-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.pin-hint {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
}

/* Action grid */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-1);
}

.action-btn:hover {
  border-color: var(--border-strong);
  background: var(--surface-2);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-indigo { background: var(--info-bg); color: var(--info-text); }
.icon-violet { background: var(--purple-bg); color: var(--purple-text); }

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
}

/* Close bill */
.close-bill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px 24px 24px;
  padding: 13px;
  border: none;
  border-radius: var(--radius-sm);
  background: #DC2626;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.close-bill-btn:hover {
  background: #B91C1C;
}

/* PIN modal */
.pin-modal {
  width: 340px;
  padding: 0;
  overflow: hidden;
  animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pin-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--border);
}

.pin-lock-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-subtle);
  border: 1px solid var(--primary-subtle-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.pin-modal-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
}

.pin-modal-sub {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.pin-dots {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 28px 24px 8px;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: transparent;
  transition: all 150ms;
}

.pin-dot.filled {
  background: var(--primary);
  border-color: var(--primary);
  transform: scale(1.1);
}

.pin-error {
  font-size: 12px;
  color: var(--danger-text);
  text-align: center;
  padding: 0 20px 4px;
  min-height: 20px;
}

.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border-top: 1px solid var(--border);
  margin-top: 12px;
}

.numpad-key {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-1);
  background: var(--surface);
  border: none;
  cursor: pointer;
  transition: background var(--transition);
  user-select: none;
  -webkit-user-select: none;
  min-height: 64px;
  font-variant-numeric: tabular-nums;
}

.numpad-key:active {
  background: var(--surface-2);
}

.numpad-cancel {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
}

.numpad-cancel:active {
  color: var(--danger-text);
  background: var(--danger-bg);
}

.numpad-del {
  color: var(--text-2);
}

.numpad-del:active {
  background: var(--surface-2);
}

@keyframes pin-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.pin-shake {
  animation: pin-shake 0.4s ease;
}
</style>
