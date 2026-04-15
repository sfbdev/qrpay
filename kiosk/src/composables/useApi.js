const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function getToken() {
  return localStorage.getItem('qrpay_kiosk_token')
}

export function setToken(token) {
  localStorage.setItem('qrpay_kiosk_token', token)
}

export function removeToken() {
  localStorage.removeItem('qrpay_kiosk_token')
  localStorage.removeItem('qrpay_kiosk_user')
  localStorage.removeItem('qrpay_kiosk_tenant')
}

export function getTenantSlug() {
  return localStorage.getItem('qrpay_kiosk_tenant') || 'freya-cafe'
}

export async function api(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}
