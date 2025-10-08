<template>
  <main class="not-found app-shell">
    <section>
      <h1>404</h1>
      <p>We could not find that page.</p>
      <RouterLink :to="{ name: 'child-dashboard' }">Go home</RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 1rem;
}

h1 {
  font-size: 4rem;
  color: var(--color-text-primary);
}

a {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
