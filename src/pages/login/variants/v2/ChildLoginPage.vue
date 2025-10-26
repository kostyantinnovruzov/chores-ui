<template>
  <main class="child-login app-shell">
    <div class="child-login__halo child-login__halo--primary" aria-hidden="true"></div>
    <div class="child-login__halo child-login__halo--secondary" aria-hidden="true"></div>

    <section class="child-login__content">
      <header class="child-login__hero">
        <h1 class="child-login__title">🌟 Chores Fun! 🌟</h1>
        <p class="child-login__subtitle">{{ t('features.authKid.pickProfileSubtitle') }}</p>
      </header>

      <section class="child-login__stage">
        <KidProfilePicker
          :kids="kidProfiles"
          :is-loading="isKidsLoading"
          :is-error="isKidsError"
          :selected-kid-id="selectedKidId"
          @select="$emit('select-kid', $event)"
          @highlight="$emit('highlight-kid', $event)"
          @retry="$emit('retry-kids')"
        />

        <KidLoginForm
          class="child-login__form"
          :selected-child="selectedKid"
          @change-child="$emit('change-kid')"
        />
      </section>

      <footer v-if="showParentControls" class="child-login__parent">
        <span>{{ t('features.authParent.loggedInAs', { email: parentEmail }) }}</span>
        <button type="button" @click="$emit('logout-parent')">
          {{ t('common.actions.logout') }}
        </button>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { KidProfile } from '@/entities/kid';
import { KidLoginForm, KidProfilePicker } from '@/features/auth-kid';

defineProps<{
  kidProfiles: KidProfile[];
  isKidsLoading: boolean;
  isKidsError: boolean;
  selectedKid: KidProfile | null;
  selectedKidId: KidProfile['id'] | null;
  parentEmail: string;
  showParentControls: boolean;
}>();

defineEmits<{
  (e: 'select-kid', kid: KidProfile): void;
  (e: 'highlight-kid', kid: KidProfile): void;
  (e: 'change-kid'): void;
  (e: 'retry-kids'): void;
  (e: 'logout-parent'): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.child-login {
  position: relative;
  min-height: 100vh;
  padding: clamp(2rem, 6vw, 4rem);
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top left, #f5c4ff 0%, #b8c8ff 45%, #f5f8ff 100%);
  overflow: hidden;
}

.child-login__halo {
  position: absolute;
  width: clamp(360px, 50vw, 540px);
  height: clamp(360px, 50vw, 540px);
  border-radius: 50%;
  opacity: 0.35;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: blur(0);
}

.child-login__halo--primary {
  top: 10%;
  left: 15%;
  background: radial-gradient(circle, rgba(246, 211, 101, 0.85), rgba(255, 255, 255, 0.1) 70%);
  animation: float-halo 12s ease-in-out infinite alternate;
}

.child-login__halo--secondary {
  bottom: -12%;
  right: -8%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.75), rgba(236, 254, 255, 0.2) 70%);
  animation: float-halo 16s ease-in-out infinite alternate;
}

@keyframes float-halo {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-45%, -55%) scale(1.1);
  }
}

.child-login__content {
  position: relative;
  width: min(1000px, 100%);
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
  z-index: 1;
}

.child-login__hero {
  text-align: center;
  color: #1f1f3d;
  display: grid;
  gap: 0.75rem;
}

.child-login__title {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 3.2rem);
  font-weight: 800;
  text-shadow: 0 16px 45px rgba(129, 140, 248, 0.35);
}

.child-login__subtitle {
  margin: 0;
  font-size: clamp(1.05rem, 3vw, 1.2rem);
  color: rgba(31, 31, 61, 0.75);
}

.child-login__stage {
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
  justify-items: center;
}

.child-login__form {
  width: 100%;
}

.child-login__parent {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 16px 32px rgba(79, 70, 229, 0.2);
  font-weight: 500;
  color: rgba(31, 31, 61, 0.75);
}

.child-login__parent button {
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.child-login__parent button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(99, 102, 241, 0.3);
}
</style>
