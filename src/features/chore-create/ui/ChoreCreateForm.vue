<template>
  <component
    :is="activeComponent"
    ref="innerFormRef"
    v-bind="forwardedProps"
    @submitted="emit('submitted', $event)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import ChoreCreateFormV1 from './variants/v1/ChoreCreateForm.vue';
import ChoreCreateFormV2 from './variants/v2/ChoreCreateForm.vue';

import { useDesignVersion } from '@/shared/lib/design';

const props = withDefaults(
  defineProps<{
    showHeader?: boolean;
    mode?: 'create' | 'edit';
    choreId?: number | null;
  }>(),
  {
    showHeader: true,
    mode: 'create',
    choreId: null
  }
);

const emit = defineEmits<{
  (e: 'submitted', payload?: { mode: 'create' | 'edit' }): void;
}>();

const forwardedProps = props;

const designVersion = useDesignVersion();

const variantMap = {
  v1: ChoreCreateFormV1,
  v2: ChoreCreateFormV2,
  v3: ChoreCreateFormV2
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? ChoreCreateFormV1);

type InnerFormExpose = {
  setInitialValues?: (payload: Record<string, unknown>) => void;
  resetForm?: () => void;
};

const innerFormRef = ref<InnerFormExpose | null>(null);

function setInitialValues(values: Record<string, unknown>) {
  innerFormRef.value?.setInitialValues?.(values);
}

function resetForm() {
  innerFormRef.value?.resetForm?.();
}

defineExpose({
  setInitialValues,
  resetForm
});
</script>
