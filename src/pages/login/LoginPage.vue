<script setup lang="ts">
import { computed } from 'vue';

import { useChildLoginController } from './useChildLoginController';
import ChildLoginPageV1 from './variants/v1/ChildLoginPage.vue';
import ChildLoginPageV2 from './variants/v2/ChildLoginPage.vue';

import { useDesignVersion } from '@/shared/lib/design';

const designVersion = useDesignVersion();

const {
  kidProfiles,
  isKidsLoading,
  isKidsError,
  selectedKid,
  parentEmail,
  showParentControls,
  handleSelectKid,
  handleHighlightKid,
  handleChangeKid,
  handleRetryKids,
  handleLogoutParent
} = useChildLoginController();

const selectedKidId = computed(() => selectedKid.value?.id ?? null);

const variantMap = {
  v1: ChildLoginPageV1,
  v2: ChildLoginPageV2
} as const;

const activeComponent = computed(() => variantMap[designVersion.value] ?? ChildLoginPageV1);
</script>

<template>
  <component
    :is="activeComponent"
    :kid-profiles="kidProfiles"
    :is-kids-loading="isKidsLoading"
    :is-kids-error="isKidsError"
    :selected-kid="selectedKid"
    :selected-kid-id="selectedKidId"
    :parent-email="parentEmail"
    :show-parent-controls="showParentControls"
    @select-kid="handleSelectKid"
    @highlight-kid="handleHighlightKid"
    @change-kid="handleChangeKid"
    @retry-kids="handleRetryKids"
    @logout-parent="handleLogoutParent"
  />
</template>
