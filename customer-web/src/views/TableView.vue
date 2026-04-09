<template>
  <div class="screen">
    <!-- Header -->
    <header>
      <div class="header-brand">
        <div class="logo-sm">🍽️</div>
        <div>
          <div class="brand-name">Freya Cafe</div>
          <div class="table-tag">{{ t.table }} {{ $route.params.tableId }}</div>
        </div>
      </div>
      <div class="header-user">{{ guestName }}</div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', tab === 'bill' && 'active']" @click="tab = 'bill'">{{ t.bill }}</button>
      <button :class="['tab', tab === 'menu' && 'active']" @click="tab = 'menu'">{{ t.menu }}</button>
    </div>

    <!-- Bill Tab -->
    <div v-if="tab === 'bill'" class="content">
      <div v-if="items.length === 0" class="empty">{{ t.emptyBill }}</div>

      <div v-else>
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
            >{{ t.selectItems }}</button>
            <button
              :class="['split-btn', splitMode === 'equal' && 'active']"
              @click="splitMode = 'equal'"
            >{{ t.equalSplit }}</button>
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
                <span v-if="selectedIds.includes(item.id)">✓</span>
              </div>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">{{ formatPrice(item.price) }}</span>
            </div>

            <div v-if="selectedIds.length > 0" class="my-total">
              <span>{{ t.myTotal }}</span>
              <strong>{{ formatPrice(myTotal) }}</strong>
            </div>
          </div>

          <div v-if="splitMode === 'equal'" class="equal-info">
            <p>{{ t.equalDesc }}</p>
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

        <button class="btn btn-primary" @click="callWaiter">{{ t.callWaiter }}</button>
      </div>
    </div>

    <!-- Menu Tab -->
    <div v-if="tab === 'menu'" class="content">
      <div v-for="cat in menuCategories" :key="cat.id" class="menu-category">
        <div class="cat-title">{{ cat.name }}</div>
        <div class="card">
          <div v-for="(product, i) in cat.products" :key="product.id" class="product-row" :class="{ last: i === cat.products.length - 1 }">
            <img v-if="product.image" :src="product.image" class="product-img" />
            <div class="product-img placeholder" v-else>🍽️</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-desc">{{ product.desc }}</div>
              <div class="product-price">{{ formatPrice(product.price) }}</div>
            </div>
            <button class="add-btn" @click="addToOrder(product)">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Order Modal -->
  <div v-if="orderModal" class="modal-backdrop" @click.self="orderModal = null">
    <div class="modal card">
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
      <button class="btn btn-primary" @click="confirmOrder">{{ t.addOrder }}</button>
      <button class="btn btn-outline" style="margin-top:8px" @click="orderModal = null">{{ t.cancel }}</button>
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
    orderItems: 'Siparişler', splitPayment: 'Split Ödeme',
    selectItems: 'Kalem seç', equalSplit: 'Eşit böl',
    myTotal: 'Benim payım', mine: 'Ben',
    equalDesc: 'Hesap masadaki kişi sayısına eşit bölünür.',
    perPerson: 'kişi başı', callWaiter: 'Ödeme İstiyorum',
    subtotal: 'Ara Toplam', vat: 'KDV', total: 'Toplam',
    note: 'Not (ekstra / çıkarma)', notePlaceholder: 'örn. az pişmiş, soğansız',
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
    id: 1, name: '🍕 Pizza',
    products: [
      { id: 101, name: 'Margherita', desc: 'Domates, mozzarella', price: 280, image: null,
        variations: [{ name: 'Boy', options: [{ label: 'S' }, { label: 'M' }, { label: 'L' }] }] },
      { id: 102, name: 'Sucuklu', desc: 'Sucuk, biber, mozzarella', price: 320, image: null, variations: [] },
    ]
  },
  {
    id: 2, name: '🥤 İçecekler',
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
  return '₺' + val.toLocaleString('tr-TR')
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
  alert('Ödeme isteği gönderildi!')
}
</script>

<style scoped>
.screen { flex: 1; display: flex; flex-direction: column; }

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.header-brand { display: flex; align-items: center; gap: 10px; }
.logo-sm {
  width: 36px; height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.brand-name { font-weight: 700; font-size: 15px; }
.table-tag { font-size: 12px; color: var(--muted); }
.header-user {
  font-size: 13px; font-weight: 600;
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 20px;
}

.tabs {
  display: flex;
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.tab {
  flex: 1; padding: 12px; border: none;
  background: transparent; font-size: 15px; font-weight: 600;
  cursor: pointer; color: var(--muted);
  border-bottom: 2px solid transparent;
  transition: all .15s;
}
.tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.content { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }

.empty { text-align: center; color: var(--muted); padding: 48px 0; }
.section-title { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }

.items-list { padding: 0; overflow: hidden; }
.item-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.item-row:last-child { border-bottom: none; }
.item-row.claimed { opacity: .45; }
.item-row.mine { background: #FFF5F5; }
.item-info { display: flex; flex-direction: column; gap: 2px; }
.item-name { font-size: 15px; font-weight: 500; }
.item-note { font-size: 12px; color: var(--muted); }
.item-right { display: flex; align-items: center; gap: 8px; }
.item-price { font-weight: 600; font-size: 15px; }

.badge {
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 20px;
}
.mine-badge { background: var(--primary); color: #fff; }
.taken-badge { background: var(--border); color: var(--muted); }

.split-card { display: flex; flex-direction: column; gap: 16px; }
.split-options { display: flex; gap: 8px; }
.split-btn {
  flex: 1; padding: 10px; border: 2px solid var(--border);
  border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; background: transparent; color: var(--muted);
  transition: all .15s;
}
.split-btn.active { border-color: var(--primary); color: var(--primary); background: #FFF5F5; }

.selectable-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.selectable-row:last-of-type { border-bottom: none; }
.checkbox {
  width: 22px; height: 22px;
  border: 2px solid var(--border); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  transition: all .15s;
}
.checkbox.checked { background: var(--primary); border-color: var(--primary); color: #fff; }
.selectable-row .item-name { flex: 1; font-size: 15px; }
.selectable-row .item-price { font-weight: 600; }

.my-total {
  display: flex; justify-content: space-between;
  padding-top: 12px; font-size: 15px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
.my-total strong { color: var(--primary); font-size: 17px; }

.equal-info { text-align: center; padding: 8px 0; }
.equal-info p { color: var(--muted); font-size: 14px; }
.equal-amount { font-size: 36px; font-weight: 800; color: var(--primary); margin: 12px 0 4px; }
.equal-sub { font-size: 13px; color: var(--muted); }

.summary-card { display: flex; flex-direction: column; gap: 10px; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--muted); }
.summary-row.total { font-size: 17px; font-weight: 700; color: var(--text); padding-top: 10px; border-top: 1px solid var(--border); }

/* Menu */
.menu-category { display: flex; flex-direction: column; gap: 8px; }
.cat-title { font-size: 14px; font-weight: 700; }
.product-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
.product-row.last { border-bottom: none; }
.product-img {
  width: 52px; height: 52px; border-radius: 10px;
  object-fit: cover; flex-shrink: 0;
  background: var(--bg); display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.product-info { flex: 1; }
.product-name { font-weight: 600; font-size: 15px; }
.product-desc { font-size: 12px; color: var(--muted); margin: 2px 0; }
.product-price { font-size: 14px; font-weight: 700; color: var(--primary); }
.add-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--primary); color: #fff; border: none;
  font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  display: flex; align-items: flex-end;
  z-index: 100;
}
.modal {
  width: 100%; max-width: 430px; margin: 0 auto;
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
}
.modal h3 { font-size: 20px; font-weight: 700; }
.var-label { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
.var-options { display: flex; gap: 8px; flex-wrap: wrap; }
.var-opt {
  padding: 8px 16px; border: 2px solid var(--border); border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer; background: transparent;
  color: var(--text); transition: all .15s;
}
.var-opt.active { border-color: var(--primary); background: #FFF5F5; color: var(--primary); }
.note-area { display: flex; flex-direction: column; gap: 6px; }
.note-area label { font-size: 13px; font-weight: 600; color: var(--muted); }
.note-area input {
  padding: 12px 14px; border: 2px solid var(--border); border-radius: 10px;
  font-size: 15px; outline: none;
}
.note-area input:focus { border-color: var(--primary); }
</style>
