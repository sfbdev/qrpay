<template>
  <div class="screen">
    <div class="top">
      <div class="logo">🍽️</div>
      <h1>QRPay</h1>
      <p>Garson girişi</p>
    </div>

    <form @submit.prevent="login">
      <div class="field">
        <label>E-posta</label>
        <input v-model="email" type="email" placeholder="garson@freyacafe.com" autocomplete="email" />
      </div>
      <div class="field">
        <label>Şifre</label>
        <input v-model="password" type="password" placeholder="••••••••" />
      </div>
      <button type="submit" class="btn btn-primary">Giriş Yap</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

function login() {
  // TODO: API auth
  router.push('/app/tables')
}
</script>

<style scoped>
.screen {
  flex: 1; min-height: 100dvh;
  display: flex; flex-direction: column;
  justify-content: center; padding: 32px 24px; gap: 40px;
  background: var(--card);
}
.top { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.logo {
  width: 72px; height: 72px; border-radius: 22px;
  background: var(--primary); font-size: 34px;
  display: flex; align-items: center; justify-content: center;
}
h1 { font-size: 28px; font-weight: 800; }
p { color: var(--muted); font-size: 15px; }

form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 13px; font-weight: 600; color: var(--muted); }
input {
  padding: 14px 16px; border: 2px solid var(--border); border-radius: var(--radius);
  font-size: 16px; outline: none; transition: border-color .15s;
}
input:focus { border-color: var(--primary); }
</style>
