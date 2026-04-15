<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Menu</h1>
        <p class="page-subtitle">Manage your products and categories</p>
      </div>
      <button class="btn btn-primary" @click="openProductModal(null)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Item
      </button>
    </div>

    <div class="page-body">
      <div class="menu-layout">
        <!-- Categories -->
        <div class="cats-panel">
          <div class="panel-label">Categories</div>
          <div class="cats-list">
            <div
              v-for="cat in categories"
              :key="cat.id"
              :class="['cat-item', activeCategory === cat.id && 'active']"
              @click="activeCategory = cat.id"
            >
              <div class="cat-left">
                <span class="cat-icon">{{ cat.icon }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </div>
              <span class="cat-count">{{ cat.products.length }}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm add-cat-btn" @click="addCategory">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Category
          </button>
        </div>

        <!-- Products -->
        <div class="products-panel">
          <div class="products-grid">
            <div v-for="p in activeProducts" :key="p.id" class="product-card card">
              <div class="product-row">
                <div class="product-icon-box">
                  <span v-if="!p.image">{{ getCategoryIcon(p.categoryId) }}</span>
                  <img v-else :src="p.image" alt="" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-desc">{{ p.desc }}</div>
                  <div class="product-price">{{ p.price.toLocaleString('tr-TR') }} TL</div>
                </div>
                <div class="product-actions">
                  <button class="btn btn-secondary btn-sm" @click="openProductModal(p)">Edit</button>
                  <div
                    :class="['avail-toggle', p.available && 'on']"
                    @click="toggleAvail(p)"
                    :title="p.available ? 'Active' : 'Inactive'"
                  >
                    <div class="avail-thumb"></div>
                  </div>
                </div>
              </div>
              <div v-if="p.variations?.length" class="product-vars">
                <span v-for="v in p.variations" :key="v.name" class="var-tag">{{ v.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <Transition name="modal">
      <div v-if="productModal" class="modal-backdrop" @click.self="productModal = null">
        <div class="modal card">
          <div class="modal-header">
            <h3>{{ editingProduct.id ? 'Edit Item' : 'New Item' }}</h3>
            <button class="modal-close" @click="productModal = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="form">
            <div class="fields-row">
              <div class="field">
                <label>Item Name</label>
                <input v-model="editingProduct.name" placeholder="Margherita Pizza" />
              </div>
              <div class="field">
                <label>Price (TL)</label>
                <input v-model="editingProduct.price" type="number" placeholder="0" />
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <input v-model="editingProduct.desc" placeholder="Domates, mozzarella..." />
            </div>
            <div class="fields-row">
              <div class="field">
                <label>Station</label>
                <div class="toggle-group">
                  <button
                    :class="['toggle-btn', editingProduct.station === 'kitchen' && 'active']"
                    @click="editingProduct.station = 'kitchen'"
                  >
                    Kitchen
                  </button>
                  <button
                    :class="['toggle-btn', editingProduct.station === 'bar' && 'active']"
                    @click="editingProduct.station = 'bar'"
                  >
                    Bar
                  </button>
                </div>
              </div>
              <div class="field">
                <label>Category</label>
                <select v-model="editingProduct.categoryId">
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="productModal = null">Cancel</button>
            <button class="btn btn-primary" @click="saveProduct">Save</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api, getTenantSlug } from '../composables/useApi.js'

const productModal = ref(false)
const activeCategory = ref(null)
const editingProduct = ref({})
const error = ref('')
const loading = ref(false)

const categories = ref([])

async function fetchMenu() {
  try {
    const tenantSlug = getTenantSlug()
    const data = await api(`/api/menu?tenant=${tenantSlug}`)
    categories.value = (data.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '\u2603',
      products: (cat.items || []).map(item => ({
        id: item.id,
        name: item.name,
        desc: item.description || '',
        price: item.price,
        station: item.station || 'kitchen',
        available: item.available !== false,
        image: item.image || null,
        categoryId: cat.id,
        variations: item.variations || [],
      }))
    }))
    if (categories.value.length > 0 && !activeCategory.value) {
      activeCategory.value = categories.value[0].id
    }
  } catch (e) {
    error.value = e.message
  }
}

onMounted(fetchMenu)

const activeProducts = computed(() => {
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat?.products || []
})

function getCategoryIcon(catId) {
  const cat = categories.value.find(c => c.id === catId)
  return cat?.icon || '\u2603'
}

function openProductModal(p) {
  editingProduct.value = p
    ? { ...p }
    : { name: '', price: 0, desc: '', station: 'kitchen', categoryId: activeCategory.value, available: true, variations: [] }
  productModal.value = true
}

async function saveProduct() {
  loading.value = true
  try {
    const p = editingProduct.value
    if (p.id) {
      await api(`/api/menu/items/${p.id}`, {
        method: 'PUT',
        body: {
          name: p.name,
          description: p.desc,
          price: Number(p.price),
          station: p.station,
          categoryId: p.categoryId,
          available: p.available,
        },
      })
    } else {
      await api('/api/menu/items', {
        method: 'POST',
        body: {
          categoryId: p.categoryId,
          name: p.name,
          description: p.desc,
          price: Number(p.price),
          station: p.station,
          available: p.available,
        },
      })
    }
    productModal.value = false
    await fetchMenu()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function toggleAvail(p) {
  try {
    await api(`/api/menu/items/${p.id}`, {
      method: 'PUT',
      body: { available: !p.available },
    })
    p.available = !p.available
  } catch (e) {
    error.value = e.message
  }
}

async function addCategory() {
  const name = prompt('Category name:')
  if (!name) return
  loading.value = true
  try {
    await api('/api/menu/categories', {
      method: 'POST',
      body: { name, sortOrder: categories.value.length },
    })
    await fetchMenu()
  } catch (e) {
    error.value = e.message
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

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow: hidden;
}

.menu-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  height: 100%;
}

/* Categories */
.cats-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.cats-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-2);
  transition: all var(--transition);
}

.cat-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-icon {
  font-size: 16px;
}

.cat-item:hover {
  background: var(--surface);
  color: var(--text-1);
}

.cat-item.active {
  color: var(--primary);
  background: var(--primary-subtle);
  font-weight: 600;
}

.cat-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  background: var(--surface-2);
  padding: 2px 7px;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}

.cat-item.active .cat-count {
  color: var(--primary);
  background: var(--primary-subtle-border);
}

.add-cat-btn {
  margin-top: 12px;
}

/* Products */
.products-panel {
  overflow-y: auto;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card {
  padding: 20px;
  transition: border-color var(--transition);
}

.product-card:hover {
  border-color: var(--border-strong);
}

.product-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.product-icon-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-1);
}

.product-desc {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.product-price {
  font-weight: 700;
  font-size: 14px;
  color: var(--primary);
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Availability toggle */
.avail-toggle {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--border-strong);
  cursor: pointer;
  position: relative;
  transition: background var(--transition-slow);
}

.avail-toggle.on {
  background: var(--success-text);
}

.avail-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left var(--transition-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.avail-toggle.on .avail-thumb {
  left: 20px;
}

.product-vars {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-left: 64px;
}

.var-tag {
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  color: var(--text-2);
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

.modal-enter-active {
  animation: backdrop-in 0.2s ease;
}
.modal-leave-active {
  animation: backdrop-in 0.15s ease reverse;
}

.modal {
  width: 500px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.modal-close:hover {
  background: var(--surface-2);
  color: var(--text-1);
  border-color: var(--border-strong);
}

h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}

.field input,
.field select {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-1);
  outline: none;
  background: var(--surface);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.field input:focus,
.field select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-subtle);
}

.toggle-group {
  display: flex;
  gap: 6px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--surface);
  color: var(--text-2);
  transition: all var(--transition);
}

.toggle-btn:hover {
  border-color: var(--border-strong);
}

.toggle-btn.active {
  border-color: var(--primary-subtle-border);
  background: var(--primary-subtle);
  color: var(--primary);
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
