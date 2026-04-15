<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>{{ t.tablesTitle }}</h1>
        <p class="page-subtitle">{{ t.tablesSubtitle }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="handleFullscreenBtn" :title="isFullscreen ? t.exitFullscreen : t.enterFullscreen">
          <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
            <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
          </svg>
          {{ isFullscreen ? t.exitFullscreen : t.enterFullscreen }}
        </button>
        <button class="btn btn-primary" @click="showAddTable = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ t.addTable }}
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
            <div class="table-empty-text">{{ t.available }}</div>
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
                <div class="modal-title">{{ selected.label || t.tableLabel + ' ' + selected.number }}</div>
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
            <p class="empty-title">{{ t.tableAvailable }}</p>
            <p class="empty-desc">{{ t.noActiveSession }}</p>
            <button class="btn btn-primary open-btn" @click="openTable">{{ t.openTable }}</button>
          </div>

          <!-- Active state -->
          <div v-else class="modal-active">
            <div class="modal-stats">
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <span class="mstat-label">{{ t.guestsLabel }}</span>
                <strong class="mstat-value">{{ selected.guests }}</strong>
              </div>
              <div class="mstat-divider"></div>
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span class="mstat-label">{{ t.openedLabel }}</span>
                <strong class="mstat-value">{{ selected.openedAt }}</strong>
              </div>
              <div class="mstat-divider"></div>
              <div class="mstat">
                <div class="mstat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <span class="mstat-label">{{ t.totalLabel }}</span>
                <strong class="mstat-value">{{ selected.total.toLocaleString('tr-TR') }} TL</strong>
              </div>
            </div>

            <!-- Session PIN + QR -->
            <div class="session-pin">
              <div class="pin-qr-row">
                <div class="pin-left">
                  <div class="pin-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    {{ t.customerPin }}
                  </div>
                  <div class="pin-digits">
                    <span v-for="d in selected.pin" :key="d" class="pin-digit">{{ d }}</span>
                  </div>
                  <div class="pin-hint">{{ t.pinHint }}</div>
                </div>
                <div v-if="qrDataUrl" class="qr-box">
                  <img :src="qrDataUrl" alt="QR" class="qr-img" />
                </div>
              </div>
            </div>

            <div class="action-grid">
              <button class="action-btn" @click="viewOrders">
                <div class="action-icon icon-indigo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                <span class="action-label">{{ t.ordersLabel }}</span>
              </button>
              <button class="action-btn action-btn-primary" @click="openOrderEntry">
                <div class="action-icon icon-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
                </div>
                <span class="action-label">{{ t.enterOrder }}</span>
              </button>
            </div>

            <button class="close-bill-btn" @click="closeTable">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              {{ t.closeBill }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Table Orders Modal -->
    <Transition name="modal">
      <div v-if="showTableOrders" class="modal-backdrop" @click.self="showTableOrders = false">
        <div class="modal card torders-modal">
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="modal-table-badge">
                <span class="modal-table-num">{{ selected?.number }}</span>
              </div>
              <div class="modal-title">{{ t.ordersLabel }}</div>
            </div>
            <button class="modal-close" @click="showTableOrders = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="torders-body">
            <div v-if="loadingOrders" class="menu-loading">
              <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10" stroke-linecap="round"/></svg>
            </div>
            <div v-else-if="tableOrders.length === 0" class="torders-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              <p>{{ t.noOrdersFound }}</p>
            </div>
            <div v-else class="torders-list">
              <div v-for="order in tableOrders" :key="order.id" class="torder-card">
                <div class="torder-head">
                  <span :class="['badge', orderStatusBadge(order.status)]">{{ t.orderStatus?.[order.status] || order.status }}</span>
                  <span class="torder-source">{{ order.source === 'KIOSK' ? 'Kiosk' : 'Müşteri' }}</span>
                  <span class="torder-time">{{ formatTime(order.createdAt) }}</span>
                </div>
                <div class="torder-items">
                  <div v-for="item in order.items" :key="item.id" class="torder-item">
                    <span class="torder-qty">{{ item.quantity }}×</span>
                    <span class="torder-name">{{ item.name }}</span>
                    <span class="torder-price">₺{{ (item.price * item.quantity).toLocaleString('tr-TR') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Table Modal -->
    <Transition name="modal">
      <div v-if="showAddTable" class="modal-backdrop" @click.self="showAddTable = false">
        <div class="modal card">
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="modal-table-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div class="modal-title">{{ t.addTableTitle }}</div>
            </div>
            <button class="modal-close" @click="showAddTable = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form class="add-table-form" @submit.prevent="addTable">
            <div class="form-group">
              <label class="form-label">{{ t.tableNumber }}</label>
              <input v-model="newTableNumber" type="number" min="1" class="form-input" placeholder="13" required autofocus />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t.tableLabelInput }}</label>
              <input v-model="newTableLabel" type="text" class="form-input" :placeholder="t.tableLabelInputPlaceholder" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t.tableCapacity }}</label>
              <input v-model="newTableCapacity" type="number" min="1" max="20" class="form-input" placeholder="4" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" @click="showAddTable = false">{{ t.cancel }}</button>
              <button type="submit" class="btn btn-primary" :disabled="addingTable">
                {{ addingTable ? t.adding : t.addTable }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Order Entry Modal -->
    <Transition name="modal">
      <div v-if="showOrderEntry" class="modal-backdrop" @click.self="showOrderEntry = false">
        <div class="order-modal card">
          <div class="modal-header">
            <div class="modal-title-row">
              <div class="modal-table-badge">
                <span class="modal-table-num">{{ selected?.number }}</span>
              </div>
              <div>
                <div class="modal-title">{{ t.orderEntryTitle }}</div>
              </div>
            </div>
            <button class="modal-close" @click="showOrderEntry = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="order-body">
            <!-- Category tabs -->
            <div class="cat-tabs">
              <button
                :class="['cat-tab', selectedCategory === null && 'cat-tab-active']"
                @click="selectedCategory = null"
              >{{ t.allItems }}</button>
              <button
                v-for="cat in menuCategories"
                :key="cat.id"
                :class="['cat-tab', selectedCategory === cat.id && 'cat-tab-active']"
                @click="selectedCategory = cat.id"
              >{{ cat.name }}</button>
            </div>

            <!-- Items grid -->
            <div v-if="loadingMenu" class="menu-loading">
              <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0110 10" stroke-linecap="round"/></svg>
            </div>
            <div v-else class="items-grid">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                class="item-card"
              >
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-price">₺{{ item.price.toLocaleString('tr-TR') }}</div>
                </div>
                <div class="item-qty-ctrl">
                  <button class="qty-btn" @click="cartRemove(item)" :disabled="!cartQty(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span class="qty-num" :class="cartQty(item) > 0 && 'qty-active'">{{ cartQty(item) }}</span>
                  <button class="qty-btn qty-add" @click="cartAdd(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart footer -->
          <div class="order-footer">
            <div v-if="cartItems.length === 0" class="cart-empty">{{ t.cartEmpty }}</div>
            <div v-else class="cart-summary">
              <span class="cart-count">{{ cartItems.reduce((s, c) => s + c.quantity, 0) }} ürün</span>
              <span class="cart-total">₺{{ cartTotal.toLocaleString('tr-TR') }}</span>
            </div>
            <button
              class="btn btn-primary submit-order-btn"
              :disabled="cartItems.length === 0 || submittingOrder"
              @click="submitOrder"
            >
              {{ submittingOrder ? t.submitting : t.submitOrder }}
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
              <div class="pin-modal-title">{{ t.enterPin }}</div>
              <div class="pin-modal-sub">{{ t.enterPinToExit }}</div>
            </div>
          </div>

          <div :class="['pin-dots', pinError && 'pin-shake']" @animationend="pinError = false">
            <div v-for="i in 4" :key="i" :class="['pin-dot', pinDigits.length >= i && 'filled']"></div>
          </div>
          <p v-if="pinError" class="pin-error">{{ t.incorrectPin }}</p>

          <div class="numpad">
            <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="numpad-key" @click="numpadPress(n)">{{ n }}</button>
            <button class="numpad-key numpad-cancel" @click="cancelPin">{{ t.cancel }}</button>
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useFullscreen } from '../composables/useFullscreen.js'
import { api, getTenantSlug } from '../composables/useApi.js'
import { t } from '../composables/useLang.js'
import { toastSuccess, toastError } from '../composables/useToast.js'
import QRCode from 'qrcode'

const router = useRouter()
const showAddTable = ref(false)
const selected = ref(null)
const error = ref('')
const loading = ref(false)
const qrDataUrl = ref('')

// Add Table form
const newTableNumber = ref('')
const newTableLabel = ref('')
const newTableCapacity = ref(4)
const addingTable = ref(false)

// Table Orders
const showTableOrders = ref(false)
const tableOrders = ref([])
const loadingOrders = ref(false)

// Order Entry
const showOrderEntry = ref(false)
const menuCategories = ref([])
const selectedCategory = ref(null)
const cart = ref({}) // { [menuItemId]: { item, quantity } }
const submittingOrder = ref(false)
const loadingMenu = ref(false)

const cartItems = computed(() => Object.values(cart.value).filter(c => c.quantity > 0))
const cartTotal = computed(() => cartItems.value.reduce((s, c) => s + c.item.price * c.quantity, 0))

const filteredItems = computed(() => {
  if (!selectedCategory.value) {
    return menuCategories.value.flatMap(c => c.items)
  }
  return menuCategories.value.find(c => c.id === selectedCategory.value)?.items || []
})

const CUSTOMER_URL = import.meta.env.VITE_CUSTOMER_URL || window.location.origin

async function generateQR(tableId) {
  const slug = getTenantSlug()
  const url = `${CUSTOMER_URL}/r/${slug}/t/${tableId}`
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 180,
      margin: 2,
      color: { dark: '#09090B', light: '#FFFFFF' },
    })
  } catch {
    qrDataUrl.value = ''
  }
}

watch(selected, (val) => {
  if (val && val.status !== 'empty') {
    generateQR(val.id)
  } else {
    qrDataUrl.value = ''
  }
})
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

function mapTable(tbl) {
  const activeSession = tbl.sessions?.find(s => s.status === 'ACTIVE')
  const sessionTotal = activeSession?.orders?.reduce((sum, o) => {
    return sum + (o.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0)
  }, 0) || 0
  const openedAt = activeSession?.createdAt
    ? new Date(activeSession.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  return {
    id: tbl.id,
    number: tbl.number,
    label: tbl.label,
    capacity: tbl.capacity,
    status: tbl.status === 'OPEN' ? 'open' : tbl.status === 'CLOSED' ? 'payment' : 'empty',
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
  return t.value.tableStatus?.[s] || s
}
function statusBadge(s) {
  return { empty: 'badge-gray', open: 'badge-green', waiting: 'badge-blue', payment: 'badge-yellow' }[s] || 'badge-gray'
}
function orderStatusBadge(s) {
  return { PENDING_APPROVAL: 'badge-yellow', APPROVED: 'badge-blue', SERVED: 'badge-green', CANCELLED: 'badge-gray' }[s] || 'badge-gray'
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function selectTable(tbl) { selected.value = tbl }

async function openTable() {
  loading.value = true
  try {
    await api(`/api/tables/${selected.value.id}/open`, {
      method: 'POST',
      body: {},
    })
    await fetchTables()
    const updated = tables.value.find(tbl => tbl.id === selected.value.id)
    selected.value = updated || null
    toastSuccess(t.value.tableOpened)
  } catch (e) {
    toastError(e.message)
  } finally {
    loading.value = false
  }
}

async function closeTable() {
  loading.value = true
  try {
    await api(`/api/tables/${selected.value.id}/close`, { method: 'POST', body: {} })
    toastSuccess(t.value.tableClosed)
    selected.value = null
    await fetchTables()
  } catch (e) {
    toastError(e.message)
  } finally {
    loading.value = false
  }
}

async function addTable() {
  const num = parseInt(newTableNumber.value)
  if (!num || num < 1) return
  addingTable.value = true
  try {
    await api('/api/tables', {
      method: 'POST',
      body: {
        number: num,
        label: newTableLabel.value || undefined,
        capacity: parseInt(newTableCapacity.value) || 4,
      },
    })
    toastSuccess(t.value.tableAdded)
    showAddTable.value = false
    newTableNumber.value = ''
    newTableLabel.value = ''
    newTableCapacity.value = 4
    await fetchTables()
  } catch (e) {
    const msg = e.message?.includes('409') || e.message?.includes('already')
      ? t.value.tableDuplicate
      : e.message
    toastError(msg)
  } finally {
    addingTable.value = false
  }
}

async function openOrderEntry() {
  showOrderEntry.value = true
  cart.value = {}
  selectedCategory.value = null
  if (menuCategories.value.length === 0) {
    loadingMenu.value = true
    try {
      const data = await api('/api/menu/categories')
      menuCategories.value = data
    } catch (e) {
      toastError(e.message)
    } finally {
      loadingMenu.value = false
    }
  }
}

function cartAdd(item) {
  if (!cart.value[item.id]) {
    cart.value = { ...cart.value, [item.id]: { item, quantity: 1 } }
  } else {
    cart.value = { ...cart.value, [item.id]: { ...cart.value[item.id], quantity: cart.value[item.id].quantity + 1 } }
  }
}

function cartRemove(item) {
  if (!cart.value[item.id]) return
  const q = cart.value[item.id].quantity - 1
  if (q <= 0) {
    const c = { ...cart.value }
    delete c[item.id]
    cart.value = c
  } else {
    cart.value = { ...cart.value, [item.id]: { ...cart.value[item.id], quantity: q } }
  }
}

function cartQty(item) {
  return cart.value[item.id]?.quantity || 0
}

async function submitOrder() {
  if (cartItems.value.length === 0) return
  submittingOrder.value = true
  try {
    await api('/api/orders', {
      method: 'POST',
      body: {
        sessionId: selected.value.sessionId,
        source: 'KIOSK',
        items: cartItems.value.map(c => ({ menuItemId: c.item.id, quantity: c.quantity })),
      },
    })
    toastSuccess(t.value.orderSent)
    showOrderEntry.value = false
    cart.value = {}
    await fetchTables()
    const updated = tables.value.find(tbl => tbl.id === selected.value.id)
    if (updated) selected.value = updated
  } catch (e) {
    toastError(e.message)
  } finally {
    submittingOrder.value = false
  }
}

async function viewOrders() {
  showTableOrders.value = true
  tableOrders.value = []
  loadingOrders.value = true
  try {
    const data = await api(`/api/orders?sessionId=${selected.value.sessionId}`)
    tableOrders.value = data
  } catch (e) {
    toastError(e.message)
  } finally {
    loadingOrders.value = false
  }
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

.pin-qr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pin-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.qr-box {
  flex-shrink: 0;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  border: 1px solid var(--primary-subtle-border);
  box-shadow: var(--shadow-sm);
}

.qr-img {
  display: block;
  width: 120px;
  height: 120px;
  border-radius: 4px;
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
.icon-primary { background: var(--primary-subtle); color: var(--primary); }

.action-btn-primary {
  border-color: var(--primary-subtle-border);
  background: var(--primary-subtle);

  &:hover {
    border-color: var(--primary);
    background: var(--primary-subtle);
  }

  .action-label { color: var(--primary); }
}

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

/* Add Table form */
.add-table-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-1);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition);
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
}

/* Order Entry Modal */
.order-modal {
  width: 680px;
  max-height: 88vh;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.order-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cat-tabs {
  display: flex;
  gap: 4px;
  padding: 16px 20px 0;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.cat-tab {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: all var(--transition);

  &:hover { color: var(--text-1); }
}

.cat-tab-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.menu-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-3);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.item-card {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color var(--transition);

  &:hover { border-color: var(--border-strong); }
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.3;
}

.item-price {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.item-qty-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;

  &:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
  }

  &:disabled { opacity: 0.3; cursor: default; }
}

.qty-add {
  background: var(--primary-subtle);
  border-color: var(--primary-subtle-border);
  color: var(--primary);
}

.qty-num {
  font-size: 14px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.qty-active { color: var(--primary); }

.order-footer {
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.cart-empty {
  flex: 1;
  font-size: 13px;
  color: var(--text-3);
}

.cart-summary {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 4px 10px;
  border-radius: 20px;
}

.cart-total {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.submit-order-btn {
  padding: 10px 24px;
  font-size: 14px;
  flex-shrink: 0;
}

/* Table Orders Modal */
.torders-modal {
  width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.torders-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.torders-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--text-3);
  font-size: 13px;
}

.torders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.torder-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.torder-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.torder-source {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.torder-time {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.torder-items {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.torder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.torder-qty {
  font-weight: 700;
  color: var(--primary);
  min-width: 24px;
  font-variant-numeric: tabular-nums;
}

.torder-name {
  flex: 1;
  color: var(--text-1);
}

.torder-price {
  font-weight: 600;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

@keyframes backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
