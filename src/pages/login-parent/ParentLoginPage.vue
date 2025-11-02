<script setup lang="ts">
import { computed } from 'vue';

import ParentLoginPageV1 from './variants/v1/ParentLoginPage.vue';
import ParentLoginPageV2 from './variants/v2/ParentLoginPage.vue';

import { useDesignVersion } from '@/shared/lib/design';

const designVersion = useDesignVersion();

const variantMap = {
  v1: ParentLoginPageV1,
  v2: ParentLoginPageV2,
  v3: ParentLoginPageV2
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? ParentLoginPageV1);
</script>

<template>
  <component :is="activeComponent" />
</template>
