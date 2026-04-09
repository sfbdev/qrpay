<template>
  <div>
    <div class="topbar">
      <span class="topbar-back" @click="router.back()">‹</span>
      <span class="topbar-title">Masa {{ table.number }}</span>
      <span></span>
    </div>

    <div class="content">
      <!-- Empty table -->
      <div v-if="table.status === 'empty'" class="empty-state">
        <div class="empty-icon">🪑</div>
        <h2>Masa Boş</h2>
        <p>Müşteri oturdu mu? Masayı açarak oturum başlatın.</p>

        <div class="guest-input">
          <label>Kaç kişi?</label>
          <div class="guest-counter">
            <button class="counter-btn" @click="guestCount = Math.max(1, guestCount - 1)">−</button>
            <span class="counter-val">{{ guestCount }}</span>
            <button class="counter-btn" @click="guestCount++">+</button>
          </div>
        </div>

        <button class="btn btn-primary" @click="openTable">Masayı Aç</button>
      </div>

      <!-- Active table -->
      <div v-else class="active-state">
        <!-- Info -->
        <div class="info-row">
          <div class="info-card card">
            <div class="info-val">{{ table.guests }}</div>
            <div class="info-label">Kişi</div>
          </div>
          <div class="info-card card">
            <div class="info-val">{{ table.openedAt }}</div>
            <div class="info-label">Açılış</div>
          </div>
          <div class="info-card card">
            <div class="info-val">₺{{ table.total.toLocaleString('tr-TR') }}</div>
            <div class="info-label">Toplam</div>
          </div>
        </div>

        <!-- Orders -->
        <div class="section-label">Siparişler</div>
        <div class="card orders-card">
          <div v-if="table.orders.length === 0" class="no-orders">Henüz sipariş yok</div>
          <div v-for="o in table.orders" :key="o.id" class="order-row">
            <div class="order-info">
              <span class="order-name">{{ o.name }}</span>
              <span v-if="o.note" class="order-note">📝 {{ o.note }}</span>
            </div>
            <div class="order-right">
              <span class="order-price">₺{{ o.price.toLocaleString('tr-TR') }}</span>
              <span :class="['badge', orderBadge(o.status)]">{{ o.status }}</span>
            </div>
          </div>
        </div>

        <!-- Guests on table -->
        <div class="section-label">Masadaki Misafirler</div>
        <div class="card guests-card">
          <div v-for="g in table.guestList" :key="g.name" class="guest-row">
            <span class="guest-avatar">{{ g.name[0] }}</span>
            <span class="guest-name">{{ g.name }}</span>
            <span class="guest-joined">{{ g.joinedAt }}</span>
          </div>
          <div v-if="!table.guestList.length" class="no-orders">Müşteri henüz katılmadı</div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <RouterLink :to="`/app/tables/${table.id}/order`" class="btn btn-primary">
            + Sipariş Al
          </RouterLink>
          <button class="btn btn-outline" @click="showCloseConfirm = true">
            Hesabı Kapat
          </button>
        </div>
      </div>
    </div>

    <!-- Close confirm -->
    <div v-if="showCloseConfirm" class="modal-backdrop" @click.self="showCloseConfirm = false">
      <div class="modal card">
        <h3>Hesabı Kapat?</h3>
        <p>Bu işlem geri alınamaz. Kasaya bildirim gönderilecek.</p>
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" @click="showCloseConfirm = false">İptal</button>
          <button class="btn btn-danger btn-sm" @click="closeTable">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showCloseConfirm = ref(false)
const guestCount = ref(2)

const allTables = ref([
  {
    id: '3', number: 3, capacity: 4, status: 'open', guests: 4, openedAt: '19:32', total: 520,
    orders: [
      { id: 1, name: 'Margherita Pizza', price: 280, status: 'Teslim Edildi', note: 'az pişmiş' },
      { id: 2, name: 'Efes Bira x2', price: 180, status: 'Teslim Edildi', note: '' },
      { id: 3, name: 'Cola', price: 60, status: 'Hazırlanıyor', note: '' },
    ],
    guestList: [
      { name: 'Ahmet', joinedAt: '19:33' },
      { name: 'Veli', joinedAt: '19:34' },
      { name: 'Mehmet', joinedAt: '19:35' },
    ]
  },
  {
    id: '1', number: 1, capacity: 4, status: 'empty', guests: 0, openedAt: '', total: 0,
    orders: [], guestList: []
  },
  {
    id: '7', number: 7, capacity: 8, status: 'payment', guests: 6, openedAt: '18:55', total: 940,
    orders: [
      { id: 1, name: 'Sucuklu Pizza x2', price: 640, status: 'Teslim Edildi', note: '' },
      { id: 2, name: 'Efes Bira x4', price: 360, status: 'Teslim Edildi', note: '' },
    ],
    guestList: [
      { name: 'Fatma', joinedAt: '18:56' },
      { name: 'Ali', joinedAt: '18:57' },
    ]
  },
])

const table = computed(() => {
  return allTables.value.find(t => t.id === route.params.id) || {
    id: route.params.id, number: parseInt(route.params.id), capacity: 4,
    status: 'empty', guests: 0, openedAt: '', total: 0, orders: [], guestList: []
  }
})

function orderBadge(s) {
  return { 'Yeni': 'badge-red', 'Hazırlanıyor': 'badge-yellow', 'Teslim Edildi': 'badge-gray' }[s] || 'badge-gray'
}

function openTable() {
  const t = allTables.value.find(t => t.id === route.params.id)
  if (t) {
    t.status = 'open'
    t.guests = guestCount.value
    t.openedAt = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }
}

function closeTable() {
  // TODO: API + WebSocket
  showCloseConfirm.value = false
  router.push('/app/tables')
}
</script>

<style scoped>
.content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 32px 0; text-align: center;
}
.empty-icon { font-size: 64px; }
h2 { font-size: 22px; font-weight: 700; }
p { color: var(--muted); font-size: 15px; line-height: 1.5; }

.guest-input { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
label { font-size: 13px; font-weight: 600; color: var(--muted); }
.guest-counter { display: flex; align-items: center; gap: 0; border: 2px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.counter-btn {
  width: 48px; height: 48px; border: none; background: var(--bg);
  font-size: 22px; cursor: pointer; font-weight: 700; color: var(--text);
}
.counter-val { width: 56px; text-align: center; font-size: 20px; font-weight: 800; }

.info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.info-card { padding: 14px; text-align: center; }
.info-val { font-size: 18px; font-weight: 800; }
.info-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

.section-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }

.orders-card { padding: 0; overflow: hidden; }
.no-orders { padding: 16px; text-align: center; color: var(--muted); font-size: 14px; }
.order-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.order-row:last-child { border-bottom: none; }
.order-info { display: flex; flex-direction: column; gap: 2px; }
.order-name { font-weight: 600; font-size: 15px; }
.order-note { font-size: 12px; color: var(--muted); }
.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.order-price { font-weight: 700; font-size: 14px; }

.guests-card { padding: 0; overflow: hidden; }
.guest-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.guest-row:last-child { border-bottom: none; }
.guest-avatar {
  width: 34px; height: 34px; border-radius: 50%; background: var(--primary);
  color: #fff; font-size: 16px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.guest-name { flex: 1; font-weight: 600; }
.guest-joined { font-size: 12px; color: var(--muted); }

.actions { display: flex; flex-direction: column; gap: 10px; padding-bottom: 8px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; z-index: 50; }
.modal { width: 100%; max-width: 430px; margin: 0 auto; padding: 24px; border-radius: var(--radius) var(--radius) 0 0; display: flex; flex-direction: column; gap: 16px; }
h3 { font-size: 18px; font-weight: 700; }
.modal p { color: var(--muted); font-size: 14px; }
.modal-actions { display: flex; gap: 10px; }
.modal-actions .btn { flex: 1; }
</style>
