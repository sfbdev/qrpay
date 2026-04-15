<template>
  <div :class="['shell', collapsed && 'sidebar-collapsed', isFullscreen && 'is-fullscreen']">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">QRPay</div>
          <div class="brand-sub">Kiosk Panel</div>
        </div>
        <button class="collapse-btn" @click="toggleCollapse" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline v-if="!collapsed" points="15 18 9 12 15 6"/>
            <polyline v-else points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :title="collapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-middle">
        <button class="theme-toggle" @click="toggle" :title="theme === 'light' ? 'Dark mode' : 'Light mode'">
          <svg v-if="theme === 'light'" class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <svg v-else class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span class="theme-label">{{ theme === 'light' ? 'Dark' : 'Light' }}</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <div class="user-block">
          <div class="user-avatar">AY</div>
          <div class="user-info">
            <div class="user-name">Tong E.</div>
            <div class="user-role">Admin</div>
          </div>
        </div>
        <button class="logout-btn" title="Sign out" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import { useFullscreen } from '../../composables/useFullscreen.js'
import { removeToken } from '../../composables/useApi.js'

const router = useRouter()
const { theme, toggle } = useTheme()
const { isFullscreen } = useFullscreen()

const collapsed = ref(localStorage.getItem('qrpay-sidebar') === 'collapsed')
watch(collapsed, v => localStorage.setItem('qrpay-sidebar', v ? 'collapsed' : 'expanded'))

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function logout() {
  removeToken()
  router.push('/login')
}

const navItems = [
  { to: '/app/dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>', label: 'Dashboard' },
  { to: '/app/tables', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 6h14"/><path d="M3 10h18"/><path d="M5 18h14"/></svg>', label: 'Tables' },
  { to: '/app/orders', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>', label: 'Orders', badge: 3 },
  { to: '/app/cashier', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2"/><path d="M20 10h2"/></svg>', label: 'Cashier' },
  { to: '/app/menu', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>', label: 'Menu' },
  { to: '/app/staff', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>', label: 'Staff' },
  { to: '/app/settings', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>', label: 'Settings' },
]
</script>

<style lang="scss" scoped>
.shell {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 280ms cubic-bezier(0.4,0,0.2,1), background var(--transition-slow);
  overflow: hidden;
  border-right: 1px solid var(--sidebar-border);
}

.sidebar-collapsed .sidebar {
  width: 64px;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  flex-shrink: 0;
  min-height: 64px;
}

.sidebar-collapsed .sidebar-brand {
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.brand-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  transition: opacity 200ms, width 280ms;
}

.sidebar-collapsed .brand-text {
  display: none;
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--sidebar-text);
  letter-spacing: -0.4px;
  white-space: nowrap;
}

.brand-sub {
  font-size: 11px;
  color: var(--sidebar-muted);
  margin-top: 1px;
  white-space: nowrap;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--sidebar-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition);
}

.collapse-btn:hover {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-text);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  color: var(--sidebar-muted);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}

.nav-item:hover {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-text);
}

.nav-item.router-link-active {
  background: rgba(99, 102, 241, 0.15);
  color: #A5B4FC;
  font-weight: 600;
}

.sidebar-collapsed .nav-item.router-link-active {
  background: rgba(99, 102, 241, 0.15);
}

.nav-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  :deep(svg) {
    width: 18px;
    height: 18px;
  }
}

.nav-label {
  flex: 1;
  transition: opacity 200ms;
}

.sidebar-collapsed .nav-label {
  display: none;
}

.nav-badge {
  margin-left: auto;
  background: #6366F1;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-collapsed .nav-badge {
  display: none;
}

/* Theme toggle */
.sidebar-middle {
  padding: 8px;
  border-top: 1px solid var(--sidebar-border);
  border-bottom: 1px solid var(--sidebar-border);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--sidebar-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-collapsed .theme-toggle {
  justify-content: center;
  padding: 10px;
}

.theme-toggle:hover {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-text);
}

.theme-icon {
  flex-shrink: 0;
  transition: transform var(--transition-slow);
}

.theme-toggle:hover .theme-icon {
  transform: rotate(20deg);
}

.theme-label {
  flex: 1;
  text-align: left;
}

.sidebar-collapsed .theme-label {
  display: none;
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--sidebar-border);
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-collapsed .sidebar-footer {
  justify-content: center;
  padding: 12px 0;
}

.user-block {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.user-info {
  min-width: 0;
  overflow: hidden;
}

.sidebar-collapsed .user-info {
  display: none;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--sidebar-text);
  white-space: nowrap;
}

.user-role {
  font-size: 11px;
  color: var(--sidebar-muted);
}

.logout-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-muted);
  transition: all var(--transition);
  text-decoration: none;
  flex-shrink: 0;
}

.sidebar-collapsed .logout-btn {
  display: none;
}

.logout-btn:hover {
  background: rgba(220,38,38,0.12);
  color: #F87171;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  transition: background var(--transition-slow);
  min-width: 0;
}

.is-fullscreen .sidebar {
  width: 0;
  padding: 0;
  overflow: hidden;
}
</style>
