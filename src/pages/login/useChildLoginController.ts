import { computed, ref, watch, type ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { type KidProfile, useParentKidsQuery } from '@/entities/kid';
import { useSessionStore } from '@/shared/session';

export interface ChildLoginController {
  kidProfiles: ComputedRef<KidProfile[]>;
  isKidsLoading: ComputedRef<boolean>;
  isKidsError: ComputedRef<boolean>;
  selectedKid: ComputedRef<KidProfile | null>;
  parentEmail: ComputedRef<string>;
  showParentControls: ComputedRef<boolean>;
  handleSelectKid: (kid: KidProfile) => void;
  handleHighlightKid: (kid: KidProfile) => void;
  handleChangeKid: () => void;
  handleRetryKids: () => void;
  handleLogoutParent: () => void;
}

export function useChildLoginController(): ChildLoginController {
  const router = useRouter();
  const session = useSessionStore();

  const selectedKid = ref<KidProfile | null>(null);

  const {
    data: kids,
    isLoading: isKidsLoadingQuery,
    isError: isKidsErrorQuery,
    refetch: retryKids
  } = useParentKidsQuery();

  const kidProfiles = computed(() => kids.value ?? []);

  watch(
    kidProfiles,
    (list) => {
      if (!list.length) {
        selectedKid.value = null;
      }
    },
    { immediate: true }
  );

  watch(
    [kidProfiles, selectedKid],
    ([list, current]) => {
      if (!current) return;
      const exists = list.some((kid) => String(kid.id) === String(current.id));
      if (!exists) {
        selectedKid.value = list[0] ?? null;
      }
    },
    { immediate: true }
  );

  const parentEmail = computed(() => session.parent.user?.email ?? 'parent');
  const showParentControls = computed(
    () => session.isParentAuthenticated && !session.isChildAuthenticated
  );

  function handleLogoutParent() {
    session.clearAll();
    void router.push({ name: 'parent-login' });
  }

  function handleSelectKid(kid: KidProfile) {
    selectedKid.value = kid;
  }

  function handleHighlightKid(kid: KidProfile) {
    selectedKid.value = kid;
  }

  function handleChangeKid() {
    selectedKid.value = null;
  }

  function handleRetryKids() {
    void retryKids();
  }

  const isKidsLoading = computed(() => isKidsLoadingQuery.value);
  const isKidsError = computed(() => isKidsErrorQuery.value);
  const selectedKidComputed = computed(() => selectedKid.value);

  return {
    kidProfiles,
    isKidsLoading,
    isKidsError,
    selectedKid: selectedKidComputed,
    parentEmail,
    showParentControls,
    handleSelectKid,
    handleHighlightKid,
    handleChangeKid,
    handleRetryKids,
    handleLogoutParent
  };
}
