<template>
  <component :is="activeComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ChildDashboardPageV1 from './variants/v1/ChildDashboardPage.vue';
import ChildDashboardPageV2 from './variants/v2/ChildDashboardPage.vue';

import { useDesignVersion } from '@/shared/lib/design';

const designVersion = useDesignVersion();

const variantMap = {
  v1: ChildDashboardPageV1,
  v2: ChildDashboardPageV2,
  v3: ChildDashboardPageV2
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? ChildDashboardPageV1);
</script>
