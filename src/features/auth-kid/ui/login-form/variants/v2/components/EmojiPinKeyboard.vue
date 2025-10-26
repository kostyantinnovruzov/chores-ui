<template>
  <section class="pin-keyboard" :class="{ 'pin-keyboard--disabled': disabled }">
    <div class="pin-keyboard__display" aria-live="polite">
      <div
        v-for="slotIndex in slotCount"
        :key="slotIndex"
        class="pin-keyboard__slot"
        :class="{ 'pin-keyboard__slot--filled': Boolean(displayEmojis[slotIndex - 1]) }"
      >
        <span v-if="displayEmojis[slotIndex - 1]">{{ displayEmojis[slotIndex - 1] }}</span>
      </div>
    </div>

    <p class="pin-keyboard__hint">
      {{ t('features.authKid.pinInstruction', { min: minLength, max: maxLength }) }}
    </p>

    <div class="pin-keyboard__grid">
      <button
        v-for="(entry, index) in emojiEntries"
        :key="entry.value"
        type="button"
        class="pin-keyboard__key"
        :disabled="disabled || currentLength >= maxLength"
        :aria-label="`${entry.emoji}`"
        :style="{ background: buttonGradient(index) }"
        @click="append(entry)"
      >
        {{ entry.emoji }}
      </button>
    </div>

    <div class="pin-keyboard__actions">
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
        class="pin-keyboard__action"
        :disabled="disabled || !currentLength"
        @click="clear"
      >
        {{ t('features.authKid.pinKeyboard.clear') }}
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
const slotCount = computed(() => Math.max(props.maxLength, props.minLength));
const currentLength = computed(() => props.modelValue.length);
const isLengthValid = computed(
  () => currentLength.value >= props.minLength && currentLength.value <= props.maxLength
);
const displayEmojis = computed(() =>
  props.modelValue.map((digit) => DIGIT_TO_EMOJI.get(digit) ?? '')
);

const gradients = [
  'linear-gradient(135deg, #fde68a, #fbbf24)',
  'linear-gradient(135deg, #fca5a5, #f97316)',
  'linear-gradient(135deg, #a5b4fc, #60a5fa)',
  'linear-gradient(135deg, #f9a8d4, #fb7185)',
  'linear-gradient(135deg, #bef264, #4ade80)',
  'linear-gradient(135deg, #c4b5fd, #818cf8)',
  'linear-gradient(135deg, #fcd34d, #f97316)',
  'linear-gradient(135deg, #fda4af, #fb7185)',
  'linear-gradient(135deg, #fbcfe8, #f472b6)',
  'linear-gradient(135deg, #bae6fd, #60a5fa)'
];

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

function buttonGradient(index: number) {
  return gradients[index % gradients.length];
}
</script>

<style scoped>
.pin-keyboard {
  display: grid;
  gap: clamp(1.25rem, 3vw, 1.75rem);
}

.pin-keyboard--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.pin-keyboard__display {
  display: flex;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  padding: 0.85rem;
  border-radius: 999px;
  background: rgba(243, 244, 255, 0.92);
  box-shadow: inset 0 0 0 3px rgba(129, 140, 248, 0.25);
}

.pin-keyboard__slot {
  width: clamp(60px, 9vw, 70px);
  height: clamp(60px, 9vw, 70px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 3px rgba(129, 140, 248, 0.18);
  display: grid;
  place-items: center;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  color: #4338ca;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.pin-keyboard__slot--filled {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(129, 140, 248, 0.25);
}

.pin-keyboard__hint {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(49, 46, 129, 0.65);
}

.pin-keyboard__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(0.7rem, 2.5vw, 1rem);
}

.pin-keyboard__key {
  aspect-ratio: 1 / 1;
  border: none;
  border-radius: 26px;
  color: #1f1f3d;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  box-shadow: 0 18px 35px rgba(79, 70, 229, 0.22);
}

.pin-keyboard__key:hover:not(:disabled) {
  transform: translateY(-6px);
  box-shadow: 0 25px 45px rgba(79, 70, 229, 0.3);
  filter: brightness(1.05);
}

.pin-keyboard__key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pin-keyboard__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(0.65rem, 2.5vw, 0.9rem);
}

.pin-keyboard__action {
  padding: 0.85rem 1rem;
  border-radius: 18px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #1f1f3d;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.18);
}

.pin-keyboard__action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(59, 130, 246, 0.22);
  background: rgba(255, 255, 255, 0.98);
}

.pin-keyboard__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.pin-keyboard__action--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}

.pin-keyboard__action--primary:hover:not(:disabled) {
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.28);
}
</style>
