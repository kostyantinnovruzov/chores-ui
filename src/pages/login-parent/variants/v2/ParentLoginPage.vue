<template>
  <main class="parent-login-page app-shell">
    <div class="parent-login-page__halo parent-login-page__halo--primary" aria-hidden="true"></div>
    <div
      class="parent-login-page__halo parent-login-page__halo--secondary"
      aria-hidden="true"
    ></div>

    <section class="parent-login-page__content">
      <header class="parent-login-page__hero">
        <h1>🌈 Parent Portal</h1>
        <p>{{ t('features.authParent.subtitle') }}</p>
      </header>

      <ParentLoginForm />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { ParentLoginForm } from '@/features/auth-parent';

const { t } = useI18n();
</script>

<style scoped>
.parent-login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(2rem, 6vw, 4rem);
  background: radial-gradient(circle at top left, #f7d0ff 0%, #c7d2fe 45%, #f6f9ff 100%);
  overflow: hidden;
}

.parent-login-page__halo {
  position: absolute;
  width: clamp(320px, 45vw, 520px);
  height: clamp(320px, 45vw, 520px);
  border-radius: 50%;
  opacity: 0.35;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.parent-login-page__halo--primary {
  top: 12%;
  left: 18%;
  background: radial-gradient(circle, rgba(249, 168, 212, 0.85), rgba(255, 255, 255, 0.1) 70%);
  animation: parent-float 14s ease-in-out infinite alternate;
}

.parent-login-page__halo--secondary {
  bottom: -14%;
  right: -10%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.75), rgba(236, 254, 255, 0.2) 70%);
  animation: parent-float 18s ease-in-out infinite alternate;
}

@keyframes parent-float {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-46%, -54%) scale(1.08);
  }
}

.parent-login-page__content {
  position: relative;
  width: min(620px, 100%);
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  z-index: 1;
}

.parent-login-page__hero {
  text-align: center;
  color: #1f1f3d;
  display: grid;
  gap: 0.5rem;
}

.parent-login-page__hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 3rem);
  font-weight: 800;
  text-shadow: 0 18px 45px rgba(129, 140, 248, 0.35);
}

.parent-login-page__hero p {
  margin: 0;
  font-size: clamp(1.05rem, 2.5vw, 1.2rem);
  color: rgba(31, 31, 61, 0.7);
}
</style>
