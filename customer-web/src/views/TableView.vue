<template>
  <div class="screen">
    <!-- Header -->
    <header class="header">
      <div class="header-brand">
        <div class="logo-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1"/>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <div>
          <div class="brand-name">Freya Cafe</div>
          <div class="table-tag">{{ t.table }} {{ $route.params.tableId }}</div>
        </div>
      </div>
      <div class="header-user">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {{ guestName }}
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', tab === 'bill' && 'active']" @click="tab = 'bill'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        {{ t.bill }}
      </button>
      <button :class="['tab', tab === 'menu' && 'active']" @click="tab = 'menu'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        {{ t.menu }}
      </button>
    </div>

    <!-- Bill Tab -->
    <div v-if="tab === 'bill'" class="content">
      <div v-if="items.length === 0" class="empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span>{{ t.emptyBill }}</span>
      </div>

      <div v-else class="bill-content">
        <div class="section-title">{{ t.orderItems }}</div>
        <div class="card items-list">
          <div
            v-for="item in items"
            :key="item.id"
            class="item-row"
            :class="{ claimed: item.claimedBy && item.claimedBy !== guestName, mine: item.claimedBy === guestName }"
          >
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.note" class="item-note">{{ item.note }}</span>
            </div>
            <div class="item-right">
              <span class="item-price">{{ formatPrice(item.price) }}</span>
              <span v-if="item.claimedBy === guestName" class="badge mine-badge">{{ t.mine }}</span>
              <span v-else-if="item.claimedBy" class="badge taken-badge">{{ item.claimedBy }}</span>
            </div>
          </div>
        </div>

        <!-- Split section -->
        <div class="section-title">{{ t.splitPayment }}</div>
        <div class="card split-card">
          <div class="split-options">
            <button
              :class="['split-btn', splitMode === 'select' && 'active']"
              @click="splitMode = 'select'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              {{ t.selectItems }}
            </button>
            <button
              :class="['split-btn', splitMode === 'equal' && 'active']"
              @click="splitMode = 'equal'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              {{ t.equalSplit }}
            </button>
          </div>

          <div v-if="splitMode === 'select'" class="select-items">
            <div
              v-for="item in availableItems"
              :key="item.id"
              class="selectable-row"
              :class="{ selected: selectedIds.includes(item.id) }"
              @click="toggleSelect(item.id)"
            >
              <div class="checkbox" :class="{ checked: selectedIds.includes(item.id) }">
                <svg v-if="selectedIds.includes(item.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="sel-item-name">{{ item.name }}</span>
              <span class="sel-item-price">{{ formatPrice(item.price) }}</span>
            </div>

            <div v-if="selectedIds.length > 0" class="my-total">
              <span>{{ t.myTotal }}</span>
              <strong>{{ formatPrice(myTotal) }}</strong>
            </div>
          </div>

          <div v-if="splitMode === 'equal'" class="equal-info">
            <p class="equal-desc">{{ t.equalDesc }}</p>
            <div class="equal-amount">{{ formatPrice(equalShare) }}</div>
            <p class="equal-sub">{{ t.perPerson }}</p>
          </div>
        </div>

        <!-- Summary -->
        <div class="card summary-card">
          <div class="summary-row">
            <span>{{ t.subtotal }}</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ t.vat }} (%18)</span>
            <span>{{ formatPrice(vatAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ t.total }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Tab -->
    <div v-if="tab === 'menu'" class="content">
      <div v-for="cat in menuCategories" :key="cat.id" class="menu-category">
        <div class="cat-title">{{ cat.name }}</div>
        <div class="card menu-card">
          <div v-for="(product, i) in cat.products" :key="product.id" class="product-row" :class="{ last: i === cat.products.length - 1 }">
            <div v-if="product.image" class="product-img">
              <img :src="product.image" alt="" />
            </div>
            <div class="product-img placeholder" v-else>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 010 8h-1"/>
                <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              </svg>
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-desc">{{ product.desc }}</div>
              <div class="product-price">{{ formatPrice(product.price) }}</div>
            </div>
            <button class="add-btn" @click="addToOrder(product)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky bottom CTA -->
    <div v-if="tab === 'bill' && items.length > 0" class="sticky-bottom">
      <button class="btn btn-primary" @click="callWaiter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        {{ t.callWaiter }}
      </button>
    </div>
  </div>

  <!-- Order Modal -->
  <div v-if="orderModal" class="modal-backdrop" @click.self="orderModal = null">
    <div class="modal card">
      <div class="modal-handle"></div>
      <h3>{{ orderModal.name }}</h3>
      <div v-if="orderModal.variations?.length" class="variation-groups">
        <div v-for="group in orderModal.variations" :key="group.name" class="var-group">
          <div class="var-label">{{ group.name }}</div>
          <div class="var-options">
            <button
              v-for="opt in group.options"
              :key="opt.label"
              :class="['var-opt', selectedVariations[group.name] === opt.label && 'active']"
              @click="selectedVariations[group.name] = opt.label"
            >{{ opt.label }}</button>
          </div>
        </div>
      </div>
      <div class="note-area">
        <label>{{ t.note }}</label>
        <input v-model="orderNote" :placeholder="t.notePlaceholder" />
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" @click="confirmOrder">{{ t.addOrder }}</button>
        <button class="btn btn-secondary" @click="orderModal = null">{{ t.cancel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const guestName = localStorage.getItem('qrpay_name') || 'Misafir'
const lang = localStorage.getItem('qrpay_lang') || 'tr'

const i18n = {
  tr: {
    table: 'Masa', bill: 'Hesap', menu: 'Menü',
    emptyBill: 'Henüz sipariş yok.',
    orderItems: 'Siparişler', splitPayment: 'Hesap Bölme',
    selectItems: 'Kalem seç', equalSplit: 'Eşit böl',
    myTotal: 'Benim payım', mine: 'Ben',
    equalDesc: 'Hesap masadaki kişi sayısına eşit bölünür.',
    perPerson: 'kişi başı', callWaiter: 'Ödeme İstiyorum',
    subtotal: 'Ara Toplam', vat: 'KDV', total: 'Toplam',
    note: 'Not (ekstra / çıkarma)', notePlaceholder: 'ör. az pişmiş, soğansız',
    addOrder: 'Siparişe Ekle', cancel: 'İptal',
  },
  en: {
    table: 'Table', bill: 'Bill', menu: 'Menu',
    emptyBill: 'No orders yet.',
    orderItems: 'Orders', splitPayment: 'Split Payment',
    selectItems: 'Select items', equalSplit: 'Equal split',
    myTotal: 'My total', mine: 'Me',
    equalDesc: 'Bill is split equally among guests.',
    perPerson: 'per person', callWaiter: 'Request Payment',
    subtotal: 'Subtotal', vat: 'VAT', total: 'Total',
    note: 'Note (extras / removals)', notePlaceholder: 'e.g. medium rare, no onion',
    addOrder: 'Add to Order', cancel: 'Cancel',
  },
}
const t = computed(() => i18n[lang] || i18n.tr)

const tab = ref('bill')
const splitMode = ref('select')
const selectedIds = ref([])
const orderModal = ref(null)
const orderNote = ref('')
const selectedVariations = ref({})

// --- Mock data (backend'den gelecek) ---
const items = ref([
  { id: 1, name: 'Margherita Pizza', price: 280, claimedBy: null, note: '' },
  { id: 2, name: 'Cola', price: 60, claimedBy: 'Veli', note: '' },
  { id: 3, name: 'Cola', price: 60, claimedBy: null, note: '' },
  { id: 4, name: 'Efes Bira', price: 90, claimedBy: guestName, note: '' },
  { id: 5, name: 'Efes Bira', price: 90, claimedBy: null, note: '' },
])

const menuCategories = ref([
  {
    id: 1, name: 'Pizza',
    products: [
      { id: 101, name: 'Margherita', desc: 'Domates, mozzarella', price: 280, image: null,
        variations: [{ name: 'Boy', options: [{ label: 'S' }, { label: 'M' }, { label: 'L' }] }] },
      { id: 102, name: 'Sucuklu', desc: 'Sucuk, biber, mozzarella', price: 320, image: null, variations: [] },
    ]
  },
  {
    id: 2, name: 'Icecekler',
    products: [
      { id: 201, name: 'Cola', desc: '330ml', price: 60, image: null, variations: [] },
      { id: 202, name: 'Efes Bira', desc: '500ml', price: 90, image: null, variations: [] },
      { id: 203, name: 'Su', desc: '500ml', price: 20, image: null, variations: [] },
    ]
  },
])

const guestCount = ref(3)

// Computed
const availableItems = computed(() => items.value.filter(i => !i.claimedBy || i.claimedBy === guestName))
const myTotal = computed(() => items.value.filter(i => selectedIds.value.includes(i.id)).reduce((s, i) => s + i.price, 0))
const subtotal = computed(() => items.value.reduce((s, i) => s + i.price, 0))
const vatAmount = computed(() => Math.round(subtotal.value * 0.18 / 1.18))
const total = computed(() => subtotal.value)
const equalShare = computed(() => Math.ceil(total.value / guestCount.value))

function formatPrice(val) {
  return '\u20BA' + val.toLocaleString('tr-TR')
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function addToOrder(product) {
  orderModal.value = product
  orderNote.value = ''
  selectedVariations.value = {}
  if (product.variations?.length) {
    product.variations.forEach(g => {
      selectedVariations.value[g.name] = g.options[0]?.label
    })
  }
}

function confirmOrder() {
  // TODO: API call
  orderModal.value = null
}

function callWaiter() {
  // TODO: WebSocket event
  alert('Odeme istegi gonderildi!')
}
</script>

<style scoped>
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-sm {
  width: 38px;
  height: 38px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-1);
}

.table-tag {
  font-size: 12px;
  color: var(--text-2);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 20px;
}

/* Tabs */
.tabs {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-2);
  border-bottom: 2px solid transparent;
  transition: all var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* Content */
.content {
  flex: 1;
  padding: 16px 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bill-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: var(--text-3);
  font-size: 15px;
  padding: 64px 0;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: -8px;
}

/* Items list */
.items-list {
  padding: 0;
  overflow: hidden;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}

.item-row:last-child {
  border-bottom: none;
}

.item-row.claimed {
  opacity: 0.4;
}

.item-row.mine {
  background: var(--primary-subtle);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-1);
}

.item-note {
  font-size: 12px;
  color: var(--text-2);
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-price {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-1);
}

.mine-badge {
  background: var(--primary);
  color: #fff;
}

.taken-badge {
  background: var(--surface-2);
  color: var(--text-2);
}

/* Split */
.split-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.split-options {
  display: flex;
  gap: 8px;
}

.split-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-2);
  transition: all var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.split-btn.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-subtle);
}

.selectable-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.selectable-row:last-of-type {
  border-bottom: none;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-strong);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
  color: #fff;
}

.checkbox.checked {
  background: var(--primary);
  border-color: var(--primary);
}

.sel-item-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-1);
}

.sel-item-price {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-2);
}

.my-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  font-size: 15px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
  color: var(--text-1);
}

.my-total strong {
  color: var(--primary);
  font-size: 18px;
}

.equal-info {
  text-align: center;
  padding: 8px 0;
}

.equal-desc {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.5;
}

.equal-amount {
  font-size: 36px;
  font-weight: 800;
  color: var(--primary);
  margin: 12px 0 4px;
  letter-spacing: -1px;
}

.equal-sub {
  font-size: 13px;
  color: var(--text-2);
}

/* Summary */
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-2);
}

.summary-row.total {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-1);
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

/* Sticky Bottom */
.sticky-bottom {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--bg) 80%, transparent);
}

/* Menu */
.menu-category {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cat-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
}

.menu-card {
  padding: 0;
  overflow: hidden;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.product-row.last {
  border-bottom: none;
}

.product-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-1);
}

.product-desc {
  font-size: 12px;
  color: var(--text-2);
  margin: 2px 0;
}

.product-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.add-btn:active {
  transform: scale(0.92);
  background: var(--primary-hover);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: backdrop-in 0.2s ease;
}

.modal {
  width: 100%;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-strong);
  margin: 0 auto 4px;
}

.modal h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-1);
}

.var-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.var-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.var-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.var-opt {
  padding: 10px 18px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-1);
  transition: all var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.var-opt.active {
  border-color: var(--primary);
  background: var(--primary-subtle);
  color: var(--primary);
}

.note-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-area label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.note-area input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-1);
  background: var(--surface);
  outline: none;
  transition: border-color var(--transition);
}

.note-area input::placeholder {
  color: var(--text-3);
  font-weight: 400;
}

.note-area input:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
</style>
