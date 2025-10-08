<template>
  <main class="login-page app-shell">
    <ParentLoginForm />
  </main>
</template>

<script setup lang="ts">
import { ParentLoginForm } from '@/features/auth-parent';
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
</style>
