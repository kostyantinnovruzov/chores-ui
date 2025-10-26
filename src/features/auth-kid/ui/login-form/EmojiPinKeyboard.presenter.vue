<script setup lang="ts">
import { computed } from 'vue';

import EmojiPinKeyboardV1 from './variants/v1/components/EmojiPinKeyboard.vue';

import { useDesignVersion } from '@/shared/lib/design';

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

const designVersion = useDesignVersion();

const variantMap = {
  v1: EmojiPinKeyboardV1
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? EmojiPinKeyboardV1);
</script>

<template>
  <component
    :is="activeComponent"
    v-bind="props"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @complete="() => emit('complete')"
  />
</template>
