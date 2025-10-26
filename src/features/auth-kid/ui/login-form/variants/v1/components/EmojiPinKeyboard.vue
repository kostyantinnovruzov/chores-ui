<template>
  <section class="pin-keyboard" :class="{ 'pin-keyboard--disabled': disabled }">
    <div class="pin-keyboard__display" aria-live="polite">
      <template v-if="displayEmojis.length">
        <span
          v-for="(emoji, index) in displayEmojis"
          :key="`${emoji}-${index}`"
          class="pin-keyboard__dot"
        >
          {{ emoji }}
        </span>
      </template>
      <span v-else class="pin-keyboard__placeholder">
        {{ t('features.authKid.pinKeyboard.placeholder') }}
      </span>
    </div>

    <p class="pin-keyboard__hint">
      {{ t('features.authKid.pinInstruction', { min: minLength, max: maxLength }) }}
    </p>

    <div class="pin-keyboard__grid">
      <button
        v-for="entry in emojiEntries"
        :key="entry.value"
        type="button"
        class="pin-keyboard__key"
        :disabled="disabled || currentLength >= maxLength"
        :title="`${entry.emoji} → ${entry.value}`"
        @click="append(entry)"
      >
        {{ entry.emoji }}
        <span class="pin-keyboard__digit">{{ entry.value }}</span>
      </button>
    </div>

    <div class="pin-keyboard__actions">
      <button
        type="button"
        class="pin-keyboard__action"
        :disabled="disabled || !currentLength"
        @click="clear"
      >
        {{ t('features.authKid.pinKeyboard.clear') }}
      </button>
      <button
        type="button"
        class="pin-keyboard__action"
        :disabled="disabled || !currentLength"
        @click="removeLast"
      >
        {{ t('features.authKid.pinKeyboard.delete') }}
      </button>
      <button
        type="button"
        class="pin-keyboard__action pin-keyboard__action--primary"
        :disabled="disabled || !isLengthValid"
        @click="complete"
      >
        {{ t('features.authKid.pinKeyboard.submit') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  DIGIT_TO_EMOJI,
  EMOJI_PIN_ENTRIES,
  type EmojiPinEntry
} from '@/features/auth-kid/lib/emoji-pin-map';

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    disabled?: boolean;
    minLength?: number;
    maxLength?: number;
  }>(),
  {
    modelValue: () => [],
    disabled: false,
    minLength: 4,
    maxLength: 6
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'complete'): void;
}>();

const { t } = useI18n();

const emojiEntries = EMOJI_PIN_ENTRIES;
const currentLength = computed(() => props.modelValue.length);
const isLengthValid = computed(
  () => currentLength.value >= props.minLength && currentLength.value <= props.maxLength
);
const displayEmojis = computed(() =>
  props.modelValue.map((digit) => DIGIT_TO_EMOJI.get(digit) ?? '')
);

function append(entry: EmojiPinEntry) {
  if (props.disabled || currentLength.value >= props.maxLength) return;
  emit('update:modelValue', [...props.modelValue, entry.value]);
}

function clear() {
  if (props.disabled || !currentLength.value) return;
  emit('update:modelValue', []);
}

function removeLast() {
  if (props.disabled || !currentLength.value) return;
  emit('update:modelValue', props.modelValue.slice(0, -1));
}

function complete() {
  if (props.disabled || !isLengthValid.value) return;
  emit('complete');
}
</script>

<style scoped>
.pin-keyboard {
  display: grid;
  gap: 1.25rem;
}

.pin-keyboard--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.pin-keyboard__display {
  min-height: 64px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2rem;
}

.pin-keyboard__placeholder {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.pin-keyboard__dot {
  animation: bounce 0.4s ease;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}

.pin-keyboard__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  text-align: center;
}

.pin-keyboard__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}

.pin-keyboard__key {
  aspect-ratio: 1 / 1;
  border: none;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: var(--color-accent-contrast);
  font-size: 1.75rem;
  display: grid;
  place-items: center;
  position: relative;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  cursor: pointer;
}

.pin-keyboard__key:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.2);
}

.pin-keyboard__key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pin-keyboard__digit {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.pin-keyboard__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.pin-keyboard__action {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-base);
  border: none;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.pin-keyboard__action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface-alt);
}

.pin-keyboard__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pin-keyboard__action--primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.pin-keyboard__action--primary:hover:not(:disabled) {
  box-shadow: 0 12px 24px rgba(22, 163, 74, 0.25);
}
</style>
