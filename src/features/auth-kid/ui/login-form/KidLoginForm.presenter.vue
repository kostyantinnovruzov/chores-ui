<script setup lang="ts">
import { computed } from 'vue';

import KidLoginFormV1 from './variants/v1/KidLoginForm.vue';

import type { KidProfile } from '@/entities/kid';
import { useDesignVersion } from '@/shared/lib/design';

const props = defineProps<{
  selectedChild?: KidProfile | null;
}>();

const emit = defineEmits<{
  (e: 'change-child'): void;
}>();

const designVersion = useDesignVersion();

const variantMap = {
  v1: KidLoginFormV1
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? KidLoginFormV1);

const variantProps = computed(() => {
  switch (designVersion.value) {
    default:
      return {
        selectedChild: props.selectedChild
      };
  }
});
</script>

<template>
  <component
    :is="activeComponent"
    v-bind="variantProps"
    @change-child="() => emit('change-child')"
  />
</template>
