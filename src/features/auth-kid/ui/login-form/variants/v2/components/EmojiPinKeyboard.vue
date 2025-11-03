<template>
  <section class="keyboard" :class="{ 'keyboard--disabled': disabled }">
    <div class="keyboard__display" aria-live="polite">
      <div
        v-for="slotIndex in slotCount"
        :key="slotIndex"
        class="keyboard__slot"
        :class="{ 'keyboard__slot--filled': Boolean(displayEmojis[slotIndex - 1]) }"
      >
        <span v-if="displayEmojis[slotIndex - 1]">{{ displayEmojis[slotIndex - 1] }}</span>
      </div>
    </div>

    <p class="keyboard__hint">
      {{ t('features.authKid.pinInstruction', { min: minLength, max: maxLength }) }}
    </p>

    <div class="keyboard__grid">
      <button
        v-for="(entry, index) in emojiEntries"
        :key="entry.value"
        type="button"
        class="keyboard__key"
        :style="{ background: buttonGradient(index) }"
        :disabled="disabled || currentLength >= maxLength"
        :aria-label="entry.emoji"
        @click="append(entry)"
      >
        {{ entry.emoji }}
      </button>
    </div>

    <div class="keyboard__actions">
      <button
        type="button"
        class="keyboard__action"
        :disabled="disabled || !currentLength"
        @click="removeLast"
      >
        {{ t('features.authKid.pinKeyboard.delete') }}
      </button>
      <button
        type="button"
        class="keyboard__action"
        :disabled="disabled || !currentLength"
        @click="clear"
      >
        {{ t('features.authKid.pinKeyboard.clear') }}
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
  const next = [...props.modelValue, entry.value];
  emit('update:modelValue', next);
  if (next.length >= props.maxLength && next.length >= props.minLength) {
    window.setTimeout(() => emit('complete'), 150);
  }
}

function clear() {
  if (props.disabled || !currentLength.value) return;
  emit('update:modelValue', []);
}

function removeLast() {
  if (props.disabled || !currentLength.value) return;
  emit('update:modelValue', props.modelValue.slice(0, -1));
}

function buttonGradient(index: number) {
  return gradients[index % gradients.length];
}
</script>

<style scoped>
.keyboard {
  @apply grid gap-6;
}

.keyboard--disabled {
  @apply pointer-events-none opacity-60;
}

.keyboard__display {
  @apply flex items-center justify-center gap-5 rounded-full bg-indigo-50/90 px-6 py-4
    shadow-inner shadow-indigo-200/50;
}

.keyboard__slot {
  @apply grid h-16 w-16 place-items-center rounded-full border-4 border-indigo-200 bg-white
    text-3xl font-semibold text-indigo-700 transition-all duration-300;
}

.keyboard__slot--filled {
  @apply -translate-y-1.5 shadow-lg shadow-indigo-200/60;
}

.keyboard__hint {
  @apply text-center text-sm font-semibold text-indigo-800/80;
}

.keyboard__grid {
  @apply grid grid-cols-5 gap-3;
}

.keyboard__key {
  @apply flex aspect-square items-center justify-center rounded-[26px] text-4xl shadow-lg
    shadow-indigo-200/60 transition-transform duration-150 hover:-translate-y-1
    disabled:cursor-not-allowed disabled:opacity-40;
}

.keyboard__actions {
  @apply grid grid-cols-2 gap-3;
}

.keyboard__action {
  @apply rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-indigo-800 shadow-md
    shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed
    disabled:opacity-45;
}
</style>
