<script setup lang="ts">
import { computed } from 'vue';

import ParentLoginFormV1 from './variants/v1/ParentLoginForm.vue';
import ParentLoginFormV2 from './variants/v2/ParentLoginForm.vue';

import { useDesignVersion } from '@/shared/lib/design';

const designVersion = useDesignVersion();

const variantMap = {
  v1: ParentLoginFormV1,
  v2: ParentLoginFormV2,
  v3: ParentLoginFormV2
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? ParentLoginFormV1);
</script>

<template>
  <component :is="activeComponent" />
</template>
