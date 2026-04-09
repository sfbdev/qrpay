<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Settings</h1>
        <p class="page-subtitle">Configure your business preferences</p>
      </div>
      <button :class="['btn', saved ? 'btn-success-state' : 'btn-primary']" @click="save">
        <svg v-if="!saved" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ saved ? 'Saved' : 'Save Changes' }}
      </button>
    </div>

    <div class="page-body">
      <div class="settings-layout">
        <!-- Tab navigation -->
        <div class="settings-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-tab', activeTab === tab.id && 'active']"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon" v-html="tab.icon"></span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab content -->
        <div class="settings-content card">
          <Transition name="fade" mode="out-in">
            <!-- Brand -->
            <div v-if="activeTab === 'brand'" key="brand" class="tab-panel">
              <div class="panel-title">Brand Settings</div>
              <div class="panel-desc">Customize your brand identity</div>
              <div class="form-section">
                <div class="field">
                  <label>Business Name</label>
                  <input v-model="settings.brandName" />
                </div>
                <div class="field">
                  <label>Logo</label>
                  <div class="logo-upload">
                    <div class="logo-preview">F</div>
                    <div class="logo-upload-info">
                      <button class="btn btn-secondary btn-sm">Upload Photo</button>
                      <span class="upload-hint">PNG, JPG up to 2MB</span>
                    </div>
                  </div>
                </div>
                <div class="fields-row">
                  <div class="field">
                    <label>Primary Color</label>
                    <div class="color-input">
                      <div class="color-swatch-wrap">
                        <input type="color" v-model="settings.primaryColor" class="color-picker" />
                        <div class="color-swatch" :style="{ background: settings.primaryColor }"></div>
                      </div>
                      <input v-model="settings.primaryColor" class="color-hex" />
                    </div>
                  </div>
                  <div class="field">
                    <label>Secondary Color</label>
                    <div class="color-input">
                      <div class="color-swatch-wrap">
                        <input type="color" v-model="settings.secondaryColor" class="color-picker" />
                        <div class="color-swatch" :style="{ background: settings.secondaryColor }"></div>
                      </div>
                      <input v-model="settings.secondaryColor" class="color-hex" />
                    </div>
                  </div>
                </div>

                <!-- Theme selection -->
                <div class="field">
                  <label>Theme</label>
                  <div class="theme-cards">
                    <div
                      :class="['theme-card', theme === 'light' && 'active']"
                      @click="setTheme('light')"
                    >
                      <div class="theme-preview theme-preview-light">
                        <div class="tp-sidebar"></div>
                        <div class="tp-content">
                          <div class="tp-bar"></div>
                          <div class="tp-rows">
                            <div class="tp-row"></div>
                            <div class="tp-row"></div>
                          </div>
                        </div>
                      </div>
                      <span class="theme-card-label">Light</span>
                    </div>
                    <div
                      :class="['theme-card', theme === 'dark' && 'active']"
                      @click="setTheme('dark')"
                    >
                      <div class="theme-preview theme-preview-dark">
                        <div class="tp-sidebar"></div>
                        <div class="tp-content">
                          <div class="tp-bar"></div>
                          <div class="tp-rows">
                            <div class="tp-row"></div>
                            <div class="tp-row"></div>
                          </div>
                        </div>
                      </div>
                      <span class="theme-card-label">Dark</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Finance -->
            <div v-else-if="activeTab === 'finance'" key="finance" class="tab-panel">
              <div class="panel-title">Finance Settings</div>
              <div class="panel-desc">Configure currency, tax, and receipt settings</div>
              <div class="form-section">
                <div class="field">
                  <label>Currency</label>
                  <select v-model="settings.currency">
                    <option value="TRY">TRY — Turk Lirasi</option>
                    <option value="THB">THB — Tayland Bahti</option>
                    <option value="USD">USD — Amerikan Dolari</option>
                  </select>
                </div>
                <div class="field">
                  <label>VAT Rate (%)</label>
                  <input v-model="settings.vatRate" type="number" min="0" max="100" />
                </div>
                <div class="field">
                  <label>VAT Mode</label>
                  <div class="toggle-group">
                    <button
                      :class="['toggle-btn', settings.vatMode === 'inclusive' && 'active']"
                      @click="settings.vatMode = 'inclusive'"
                    >
                      Inclusive
                    </button>
                    <button
                      :class="['toggle-btn', settings.vatMode === 'exclusive' && 'active']"
                      @click="settings.vatMode = 'exclusive'"
                    >
                      Exclusive
                    </button>
                  </div>
                </div>
                <div class="field">
                  <label>Receipt Prefix (optional)</label>
                  <input v-model="settings.receiptPrefix" placeholder="e.g. CAFE" />
                  <span class="field-hint">Example: CAFE-20260414-0001</span>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div v-else-if="activeTab === 'notifications'" key="notifications" class="tab-panel">
              <div class="panel-title">Others</div>
              <div class="panel-desc">Language, notifications, and order settings</div>
              <div class="form-section">
                <div class="field">
                  <label>Default Language</label>
                  <select v-model="settings.defaultLang">
                    <option value="tr">Turkish</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <div class="toggle-label">Sound Notifications</div>
                    <div class="toggle-desc">Play sound on new order</div>
                  </div>
                  <div
                    :class="['toggle-switch', settings.soundNotif && 'on']"
                    @click="settings.soundNotif = !settings.soundNotif"
                  >
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <div class="toggle-label">Visual Notifications</div>
                    <div class="toggle-desc">Show popup on screen</div>
                  </div>
                  <div
                    :class="['toggle-switch', settings.visualNotif && 'on']"
                    @click="settings.visualNotif = !settings.visualNotif"
                  >
                    <div class="toggle-thumb"></div>
                  </div>
                </div>

                <div class="section-divider"></div>

                <div class="toggle-row">
                  <div class="toggle-info">
                    <div class="toggle-label">Order Approval</div>
                    <div class="toggle-desc">
                      <template v-if="settings.orderApprovalRequired">
                        Customer orders wait for kiosk approval
                      </template>
                      <template v-else>
                        Customer orders go directly to kitchen
                      </template>
                    </div>
                  </div>
                  <div
                    :class="['toggle-switch', settings.orderApprovalRequired && 'on']"
                    @click="settings.orderApprovalRequired = !settings.orderApprovalRequired"
                  >
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const { theme, toggle } = useTheme()
const activeTab = ref('brand')
const saved = ref(false)

function applyBrandColor(color) {
  document.documentElement.style.setProperty('--brand', color)
}

const tabs = [
  { id: 'brand', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>', label: 'Brand' },
  { id: 'finance', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>', label: 'Finance' },
  { id: 'notifications', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>', label: 'Others' },
]

const settings = reactive({
  brandName: 'Freya Cafe',
  primaryColor: '#6366F1',
  secondaryColor: '#2D2D2D',
  currency: 'TRY',
  vatRate: 18,
  vatMode: 'inclusive',
  receiptPrefix: '',
  defaultLang: 'en',
  soundNotif: true,
  visualNotif: true,
  orderApprovalRequired: false,
})

watch(() => settings.primaryColor, applyBrandColor)

onMounted(() => applyBrandColor(settings.primaryColor))

function setTheme(val) {
  if (theme.value !== val) toggle()
}

function save() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
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

.btn-success-state {
  background: var(--success-text);
  color: #fff;
  pointer-events: none;
}

.page-body {
  padding: 28px 40px 40px;
  flex: 1;
  overflow-y: auto;
}

.settings-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  max-width: 860px;
}

/* Tab navigation */
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--text-2);
  transition: all var(--transition);
  text-align: left;
}

.nav-tab:hover {
  background: var(--surface);
  color: var(--text-1);
}

.nav-tab.active {
  color: var(--primary);
  background: var(--primary-subtle);
  font-weight: 600;
}

.tab-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

/* Content */
.settings-content {
  padding: 32px;
  overflow: hidden;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
}

.panel-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 4px;
  margin-bottom: 28px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.field-hint {
  font-size: 11px;
  color: var(--text-3);
}

.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Logo */
.logo-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-preview {
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.logo-upload-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-hint {
  font-size: 11px;
  color: var(--text-3);
}

/* Color picker */
.color-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-swatch-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.color-picker {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-swatch {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  pointer-events: none;
  transition: border-color var(--transition);
}

.color-hex {
  flex: 1;
}

/* Theme cards */
.theme-cards {
  display: flex;
  gap: 12px;
}

.theme-card {
  flex: 1;
  cursor: pointer;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.theme-card:hover {
  border-color: var(--border-strong);
}

.theme-card.active {
  border-color: var(--primary);
  background: var(--primary-subtle);
}

.theme-preview {
  width: 100%;
  height: 64px;
  border-radius: var(--radius-sm);
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border);
}

.theme-preview-light .tp-sidebar { background: #0C0C0E; width: 28%; }
.theme-preview-light .tp-content { background: #FAFAFA; flex: 1; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
.theme-preview-light .tp-bar { height: 6px; background: #F4F4F5; border-radius: 2px; }
.theme-preview-light .tp-rows { display: flex; gap: 3px; flex: 1; }
.theme-preview-light .tp-row { flex: 1; background: #FFFFFF; border-radius: 2px; border: 1px solid rgba(0,0,0,0.06); }

.theme-preview-dark .tp-sidebar { background: #0C0C0E; width: 28%; }
.theme-preview-dark .tp-content { background: #09090B; flex: 1; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
.theme-preview-dark .tp-bar { height: 6px; background: #18181B; border-radius: 2px; }
.theme-preview-dark .tp-rows { display: flex; gap: 3px; flex: 1; }
.theme-preview-dark .tp-row { flex: 1; background: #111113; border-radius: 2px; border: 1px solid rgba(255,255,255,0.06); }

.theme-card-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
}

/* Toggle group */
.toggle-group {
  display: flex;
  gap: 8px;
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

.section-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* Toggle switch rows */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}

.toggle-desc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 2px;
}

.toggle-switch {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--border-strong);
  cursor: pointer;
  position: relative;
  transition: background var(--transition-slow);
  flex-shrink: 0;
}

.toggle-switch.on {
  background: var(--primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: left var(--transition-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.toggle-switch.on .toggle-thumb {
  left: 23px;
}
</style>
