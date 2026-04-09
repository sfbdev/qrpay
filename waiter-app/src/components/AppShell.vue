<template>
  <div class="shell">
    <RouterView />
    <nav class="bottom-nav">
      <RouterLink to="/app/tables" class="nav-item">
        <span class="nav-icon">🪑</span>
        <span>Masalar</span>
      </RouterLink>
      <RouterLink to="/app/orders" class="nav-item">
        <span class="nav-icon">📋</span>
        <span>Siparişler</span>
        <span v-if="newOrderCount > 0" class="nav-dot"></span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const newOrderCount = ref(2)
</script>

<style scoped>
.shell { flex: 1; display: flex; flex-direction: column; padding-bottom: calc(60px + var(--safe-bottom)); }
</style>
