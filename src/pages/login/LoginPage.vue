<template>
  <main class="login-page app-shell">
    <KidLoginForm />
  </main>
</template>

<script setup lang="ts">
import { KidLoginForm } from '@/features/auth-kid';
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
</style>
