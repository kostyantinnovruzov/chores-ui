<template>
  <main class="page">
    <div class="halo halo--primary animate-parent-float-slow" aria-hidden="true"></div>
    <div class="halo halo--secondary animate-parent-float" aria-hidden="true"></div>

    <section class="content">
      <header class="heading">
        <h1 class="title">🌈 Parent Portal</h1>
        <p class="subtitle">{{ t('features.authParent.subtitle') }}</p>
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
.page {
  @apply relative grid min-h-screen place-items-center overflow-hidden
    bg-gradient-to-br from-pink-200 via-indigo-100 to-sky-100 px-6 py-12
    sm:px-10 lg:px-16;
}

.halo {
  @apply pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full
    blur-3xl opacity-70;

  width: clamp(320px, 45vw, 520px);
  height: clamp(320px, 45vw, 520px);
}

.halo--primary {
  @apply -left-24 top-16;

  background: radial-gradient(circle, rgb(249 168 212 / 85%), rgb(255 255 255 / 10%) 70%);
}

.halo--secondary {
  @apply -right-28 -bottom-36;

  background: radial-gradient(circle, rgb(59 130 246 / 75%), rgb(236 254 255 / 20%) 70%);
}

.content {
  @apply relative z-10 grid w-full max-w-xl gap-10 text-slate-900;
}

.heading {
  @apply grid gap-3 text-center;
}

.title {
  @apply text-4xl font-extrabold tracking-tight
    drop-shadow-[0_18px_45px_rgba(129,140,248,0.35)];
}

.subtitle {
  @apply text-base text-slate-600;
}
</style>
