<template>
  <div>
    <div class="topbar">
      <span class="topbar-back" @click="router.back()">‹</span>
      <span class="topbar-title">Sipariş Al — Masa {{ route.params.id }}</span>
      <span></span>
    </div>

    <!-- Category tabs -->
    <div class="cat-tabs">
      <button
        v-for="cat in categories" :key="cat.id"
        :class="['cat-tab', activeCategory === cat.id && 'active']"
        @click="activeCategory = cat.id"
      >{{ cat.icon }} {{ cat.name }}</button>
    </div>

    <!-- Products -->
    <div class="products">
      <div v-for="p in activeProducts" :key="p.id" class="product-row card">
        <div class="product-img">{{ p.emoji }}</div>
        <div class="product-info">
          <div class="product-name">{{ p.name }}</div>
          <div class="product-price">₺{{ p.price.toLocaleString('tr-TR') }}</div>
        </div>
        <div class="qty-control">
          <button v-if="getQty(p.id) > 0" class="qty-btn minus" @click="decQty(p)">−</button>
          <span v-if="getQty(p.id) > 0" class="qty-val">{{ getQty(p.id) }}</span>
          <button class="qty-btn plus" @click="incQty(p)">+</button>
        </div>
      </div>
    </div>

    <!-- Cart bar -->
    <div v-if="cartCount > 0" class="cart-bar">
      <div class="cart-info">
        <span class="cart-count">{{ cartCount }} ürün</span>
        <span class="cart-total">₺{{ cartTotal.toLocaleString('tr-TR') }}</span>
      </div>
      <button class="btn btn-primary cart-btn" @click="showCart = true">
        Siparişi Gönder →
      </button>
    </div>
  </div>

  <!-- Cart / confirm modal -->
  <div v-if="showCart" class="modal-backdrop" @click.self="showCart = false">
    <div class="modal card">
      <div class="modal-header">
        <h3>Sipariş Özeti</h3>
        <button class="btn btn-ghost btn-sm" @click="showCart = false">✕</button>
      </div>

      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <span class="cart-item-name">{{ item.name }}</span>
          <div class="cart-item-right">
            <span class="cart-item-qty">x{{ item.qty }}</span>
            <span class="cart-item-price">₺{{ (item.price * item.qty).toLocaleString('tr-TR') }}</span>
          </div>
        </div>
      </div>

      <div class="note-field">
        <label>Genel Not</label>
        <input v-model="generalNote" placeholder="Ekstra/çıkarma, özel istek..." />
      </div>

      <button class="btn btn-primary" @click="sendOrder">Mutfağa Gönder</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showCart = ref(false)
const generalNote = ref('')
const activeCategory = ref(1)
const cart = ref({}) // { productId: qty }

const categories = [
  { id: 1, name: 'Pizza', icon: '🍕',
    products: [
      { id: 101, name: 'Margherita', price: 280, emoji: '🍕' },
      { id: 102, name: 'Sucuklu', price: 320, emoji: '🍕' },
    ]
  },
  { id: 2, name: 'İçecekler', icon: '🥤',
    products: [
      { id: 201, name: 'Cola', price: 60, emoji: '🥤' },
      { id: 202, name: 'Efes Bira', price: 90, emoji: '🍺' },
      { id: 203, name: 'Su', price: 20, emoji: '💧' },
    ]
  },
]

const activeProducts = computed(() => categories.find(c => c.id === activeCategory.value)?.products || [])

const cartItems = computed(() =>
  Object.entries(cart.value)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = categories.flatMap(c => c.products).find(p => p.id === parseInt(id))
      return { ...p, qty }
    })
)
const cartCount = computed(() => Object.values(cart.value).reduce((s, q) => s + q, 0))
const cartTotal = computed(() => cartItems.value.reduce((s, i) => s + i.price * i.qty, 0))

function getQty(id) { return cart.value[id] || 0 }
function incQty(p) { cart.value[p.id] = (cart.value[p.id] || 0) + 1 }
function decQty(p) {
  if (cart.value[p.id] > 1) cart.value[p.id]--
  else delete cart.value[p.id]
}

function sendOrder() {
  // TODO: API call
  showCart.value = false
  router.back()
}
</script>

<style scoped>
.cat-tabs {
  display: flex; gap: 8px; padding: 12px 16px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid var(--border); background: var(--card);
}
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab {
  padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;
  border: 2px solid var(--border); background: transparent; color: var(--muted);
  cursor: pointer; white-space: nowrap; transition: all .15s;
}
.cat-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }

.products { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; padding-bottom: 100px; }

.product-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.product-img { font-size: 32px; width: 44px; text-align: center; flex-shrink: 0; }
.product-info { flex: 1; }
.product-name { font-weight: 600; font-size: 15px; }
.product-price { font-size: 14px; color: var(--primary); font-weight: 700; margin-top: 2px; }

.qty-control { display: flex; align-items: center; gap: 8px; }
.qty-btn {
  width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
  font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.qty-btn.plus { background: var(--primary); color: #fff; }
.qty-btn.minus { background: var(--border); color: var(--text); }
.qty-val { font-size: 16px; font-weight: 800; min-width: 20px; text-align: center; }

.cart-bar {
  position: fixed; bottom: calc(60px + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  width: calc(100% - 32px); max-width: 398px;
  background: var(--text); color: #fff; border-radius: var(--radius);
  padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0,0,0,.25);
}
.cart-info { display: flex; flex-direction: column; gap: 2px; }
.cart-count { font-size: 13px; opacity: .7; }
.cart-total { font-size: 18px; font-weight: 800; }
.cart-btn { width: auto; padding: 10px 20px; font-size: 14px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; z-index: 50; }
.modal { width: 100%; max-width: 430px; margin: 0 auto; padding: 24px; border-radius: var(--radius) var(--radius) 0 0; display: flex; flex-direction: column; gap: 16px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
h3 { font-size: 18px; font-weight: 700; }

.cart-items { display: flex; flex-direction: column; gap: 10px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; }
.cart-item-name { font-weight: 600; }
.cart-item-right { display: flex; gap: 10px; align-items: center; }
.cart-item-qty { font-size: 13px; color: var(--muted); }
.cart-item-price { font-weight: 700; }

.note-field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; }
input {
  padding: 12px 14px; border: 2px solid var(--border); border-radius: 10px;
  font-size: 15px; outline: none; transition: border-color .15s;
}
input:focus { border-color: var(--primary); }
</style>
