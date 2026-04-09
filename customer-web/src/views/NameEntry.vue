<template>
  <div class="screen">
    <div class="top">
      <h2>{{ t.welcome }}</h2>
      <p>{{ t.subtitle }}</p>
    </div>

    <div class="form-area">
      <label>{{ t.nameLabel }}</label>
      <input
        v-model="name"
        :placeholder="t.namePlaceholder"
        maxlength="30"
        @keyup.enter="join"
        autofocus
      />
    </div>

    <button class="btn btn-primary" :disabled="!name.trim()" @click="join">
      {{ t.joinBtn }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const name = ref('')
const lang = localStorage.getItem('qrpay_lang') || 'tr'

const i18n = {
  tr: {
    welcome: 'Hoş geldiniz!',
    subtitle: 'Masaya katılmak için adınızı girin.',
    nameLabel: 'Adınız',
    namePlaceholder: 'örn. Ahmet',
    joinBtn: 'Masaya Katıl',
  },
  en: {
    welcome: 'Welcome!',
    subtitle: 'Enter your name to join the table.',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. John',
    joinBtn: 'Join Table',
  },
}

const t = computed(() => i18n[lang] || i18n.tr)

function join() {
  if (!name.value.trim()) return
  localStorage.setItem('qrpay_name', name.value.trim())
  router.push(`/r/${route.params.tenant}/t/${route.params.tableId}/bill`)
}
</script>

<style scoped>
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 24px 32px;
  gap: 32px;
}

.top h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}
.top p { color: var(--muted); font-size: 15px; }

.form-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}

input {
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 17px;
  outline: none;
  transition: border-color .15s;
  background: var(--card);
}
input:focus { border-color: var(--primary); }
</style>
