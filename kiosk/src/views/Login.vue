<template>
  <div class="login-screen">
    <div class="login-left">
      <div class="left-bg-text">QR</div>
      <div class="left-grid"></div>
      <div class="left-glow"></div>
      <div class="left-content">
        <div class="left-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <h1 class="left-title">QRPay Kiosk</h1>
        <p class="left-desc">{{ t.loginTagline }}</p>
        <div class="left-dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="right-content">
        <div class="form-badge">{{ t.welcomeBack }}</div>
        <h2 class="form-title">{{ t.signInToAccount }}</h2>
        <p class="form-subtitle">{{ t.enterCredentials }}</p>

        <form @submit.prevent="login" class="login-form">
          <div class="field">
            <label for="username">{{ t.username }}</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              :placeholder="t.usernamePlaceholder"
              autocomplete="username"
            />
          </div>
          <div class="field">
            <div class="field-header">
              <label for="password">{{ t.password }}</label>
              <a href="#" class="forgot-link">{{ t.forgotPassword }}</a>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              :placeholder="t.passwordPlaceholder"
              autocomplete="current-password"
            />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            {{ loading ? t.signingIn : t.signIn }}
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>

        <div class="form-footer">
          <span class="version">v1.0.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, setToken } from '../composables/useApi.js'
import { t } from '../composables/useLang.js'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    const tenantSlug = 'freya-bar'
    const data = await api('/auth/login', {
      method: 'POST',
      body: { tenantSlug, username: form.username, password: form.password },
    })
    setToken(data.token)
    localStorage.setItem('qrpay_kiosk_user', JSON.stringify(data.user))
    localStorage.setItem('qrpay_kiosk_tenant', tenantSlug)
    router.push('/app/dashboard')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-screen {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* Left panel */
.login-left {
  width: 42%;
  background: #0C0C0E;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.left-bg-text {
  position: absolute;
  font-size: 320px;
  font-weight: 900;
  color: rgba(255,255,255,0.02);
  letter-spacing: -12px;
  user-select: none;
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
}

.left-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

.left-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.left-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 340px;
  position: relative;
  z-index: 1;
}

.left-logo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 28px;
  animation: pulse-glow 3s ease-in-out infinite;
}

.left-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.8px;
  margin-bottom: 12px;
}

.left-desc {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255,255,255,0.45);
  margin-bottom: 36px;
}

.left-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  transition: all var(--transition);
}

.dot.active {
  background: #6366F1;
  width: 28px;
  border-radius: 4px;
}

/* Right panel */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--bg);
  transition: background var(--transition-slow);
}

.right-content {
  width: 100%;
  max-width: 380px;
}

.form-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--primary-subtle);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  border: 1px solid var(--primary-subtle-border);
}

.form-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.6px;
  margin-bottom: 6px;
}

.form-subtitle {
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 36px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}

.forgot-link {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary);
  text-decoration: none;
  transition: opacity var(--transition);
}

.forgot-link:hover {
  opacity: 0.8;
}

.field input {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-1);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition-slow);
  background: var(--surface);
}

.field input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-subtle);
}

.field input::placeholder {
  color: var(--text-3);
}

.error-msg {
  color: #DC2626;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  padding: 8px 12px;
  background: rgba(220, 38, 38, 0.08);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.login-btn {
  width: 100%;
  padding: 12px 18px;
  font-size: 14px;
  margin-top: 4px;
  transition: all var(--transition);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn:hover {
  transform: translateY(-2px);
}

.form-footer {
  margin-top: 48px;
  text-align: center;
}

.version {
  font-size: 12px;
  color: var(--text-3);
}
</style>
