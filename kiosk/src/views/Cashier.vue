<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>{{ t.cashierTitle }}</h1>
        <p class="page-subtitle">{{ t.cashierSubtitle }}</p>
      </div>
    </div>

    <div class="page-body">
      <div class="cashier-layout">
        <!-- Left: Open bills -->
        <div class="bills-panel">
          <div class="panel-label">{{ t.openBills }}</div>
          <div class="bills-list">
            <div
              v-for="bill in bills"
              :key="bill.id"
              :class="['bill-item', activeBill?.id === bill.id && 'active']"
              @click="activeBill = bill"
            >
              <div class="bill-left">
                <div class="bill-table-num">{{ bill.table }}</div>
                <div class="bill-info">
                  <div class="bill-table">Table {{ bill.table }}</div>
                  <div class="bill-meta">{{ bill.guests }} guests · {{ bill.time }}</div>
                </div>
              </div>
              <div class="bill-right">
                <div class="bill-amount">{{ bill.total.toLocaleString('tr-TR') }} TL</div>
                <span v-if="bill.paymentRequested" class="badge badge-yellow">Payment Req.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Bill detail -->
        <div class="detail-panel card" v-if="activeBill">
          <div class="detail-header">
            <div class="detail-title-block">
              <h3>Table {{ activeBill.table }}</h3>
              <span class="receipt-no">{{ activeBill.receiptNo }}</span>
            </div>
            <span v-if="activeBill.paymentRequested" class="badge badge-yellow">Payment Req.</span>
          </div>

          <div class="items-list">
            <div v-for="item in activeBill.items" :key="item.id" class="detail-item">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span v-if="item.note" class="item-note">{{ item.note }}</span>
              </div>
              <div class="item-right">
                <span class="item-qty">x{{ item.qty }}</span>
                <span class="item-price">{{ (item.price * item.qty).toLocaleString('tr-TR') }} TL</span>
              </div>
            </div>
          </div>

          <div class="summary-box">
            <div class="sum-row">
              <span>{{ t.subtotal }}</span>
              <span>{{ subtotal.toLocaleString('tr-TR') }} TL</span>
            </div>
            <div class="sum-row">
              <span>{{ t.vat }} (18%)</span>
              <span>{{ vat.toLocaleString('tr-TR') }} TL</span>
            </div>
            <div class="sum-row total">
              <span>{{ t.total }}</span>
              <strong>{{ activeBill.total.toLocaleString('tr-TR') }} TL</strong>
            </div>
          </div>

          <div class="payment-section">
            <div class="pm-label">{{ t.paymentMethod }}</div>
            <div class="pm-options">
              <button
                :class="['pm-btn', payMethod === 'cash' && 'active']"
                @click="payMethod = 'cash'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>{{ t.cash }}</span>
              </button>
              <button
                :class="['pm-btn', payMethod === 'card' && 'active']"
                @click="payMethod = 'card'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>{{ t.card }}</span>
              </button>
            </div>
          </div>

          <button class="btn btn-danger close-btn" @click="closeAccount">
            {{ t.closeBill }}
          </button>
        </div>

        <div class="detail-panel card empty-detail" v-else>
          <div class="empty-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <p class="empty-title">{{ t.selectBill }}</p>
          <p class="empty-desc">{{ t.selectBillHint }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../composables/useApi.js'
import { t } from '../composables/useLang.js'
import { toastSuccess, toastError } from '../composables/useToast.js'

const payMethod = ref('card')
const activeBill = ref(null)
const error = ref('')
const loading = ref(false)

const bills = ref([])

function mapBill(table) {
  const session = table.sessions?.find(s => s.status === 'ACTIVE')
  if (!session) return null

  const items = []
  let total = 0
  for (const order of (session.orders || [])) {
    for (const item of (order.items || [])) {
      const lineTotal = item.price * item.quantity
      total += lineTotal
      items.push({
        id: item.id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        note: item.note || '',
      })
    }
  }

  const openedAt = session.createdAt
    ? new Date(session.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  return {
    id: table.id,
    sessionId: session.id,
    table: table.number,
    guests: session.guestCount || 0,
    time: openedAt,
    total,
    paymentRequested: session.paymentRequested || false,
    receiptNo: session.receiptNo || '',
    items,
  }
}

async function fetchBills() {
  try {
    const data = await api('/api/tables')
    const openTables = data.filter(t => t.status === 'OPEN')
    bills.value = openTables.map(mapBill).filter(Boolean)
  } catch (e) {
    error.value = e.message
  }
}

onMounted(fetchBills)

const subtotal = computed(() => {
  if (!activeBill.value) return 0
  return Math.round(activeBill.value.total / 1.18)
})
const vat = computed(() => activeBill.value ? activeBill.value.total - subtotal.value : 0)

async function closeAccount() {
  if (!activeBill.value) return
  loading.value = true
  try {
    const method = payMethod.value === 'cash' ? 'CASH' : 'CARD'
    await api('/api/payments', {
      method: 'POST',
      body: {
        sessionId: activeBill.value.sessionId,
        amount: activeBill.value.total,
        method,
      },
    })
    bills.value = bills.value.filter(b => b.id !== activeBill.value.id)
    activeBill.value = null
    await fetchBills()
    toastSuccess(t.value.closeBill)
  } catch (e) {
    error.value = e.message
    toastError(e.message)
  } finally {
    loading.value = false
  }
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

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow: hidden;
}

.cashier-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  height: 100%;
}

/* Bills panel */
.bills-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.panel-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.bills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  background: var(--surface);
  border: 1px solid var(--border);
}

.bill-item:hover {
  border-color: var(--border-strong);
}

.bill-item.active {
  border-color: var(--primary-subtle-border);
  background: var(--primary-subtle);
}

.bill-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bill-table-num {
  width: 40px;
  height: 40px;
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

.bill-item.active .bill-table-num {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.bill-table {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}

.bill-meta {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.bill-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.bill-amount {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

/* Detail panel */
.detail-panel {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.empty-detail {
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  gap: 8px;
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

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-title-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

.receipt-no {
  font-size: 12px;
  color: var(--text-3);
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--surface-2);
  padding: 3px 8px;
  border-radius: 6px;
}

/* Items */
.items-list {
  display: flex;
  flex-direction: column;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}

.detail-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-1);
}

.item-note {
  font-size: 12px;
  color: var(--text-3);
}

.item-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.item-qty {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 2px 8px;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}

.item-price {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-1);
  min-width: 60px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Summary */
.summary-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: var(--surface-2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.sum-row.total {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  padding-top: 12px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

/* Payment method */
.payment-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pm-options {
  display: flex;
  gap: 12px;
}

.pm-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--surface);
  color: var(--text-2);
  transition: all var(--transition);
}

.pm-btn:hover {
  border-color: var(--border-strong);
}

.pm-btn.active {
  border-color: var(--primary-subtle-border);
  background: var(--primary-subtle);
  color: var(--primary);
}

.close-btn {
  width: 100%;
  padding: 14px;
  font-size: 14px;
}
</style>
