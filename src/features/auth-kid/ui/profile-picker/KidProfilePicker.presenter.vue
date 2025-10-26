<script setup lang="ts">
import { computed } from 'vue';

import KidProfilePickerV1 from './variants/KidProfilePicker.v1.vue';

import type { KidProfile } from '@/entities/kid';
import { useDesignVersion } from '@/shared/lib/design';

const props = defineProps<{
  kids: KidProfile[];
  isLoading?: boolean;
  isError?: boolean;
  selectedKidId?: KidProfile['id'] | null;
}>();

const emit = defineEmits<{
  (e: 'select', kid: KidProfile): void;
  (e: 'highlight', kid: KidProfile): void;
  (e: 'retry'): void;
}>();

const designVersion = useDesignVersion();

const variantMap = {
  v1: KidProfilePickerV1
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? KidProfilePickerV1);

const variantProps = computed(() => {
  switch (designVersion.value) {
    default:
      return {
        kids: props.kids,
        isLoading: props.isLoading,
        isError: props.isError
      };
  }
});
</script>

<template>
  <component
    :is="activeComponent"
    v-bind="variantProps"
    @select="(kid) => emit('select', kid)"
    @retry="() => emit('retry')"
    @highlight="(kid) => emit('highlight', kid)"
  />
</template>
