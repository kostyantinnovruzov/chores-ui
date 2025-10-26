import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { type KidProfile, useParentKidsQuery } from '@/entities/kid';
import { useSessionStore } from '@/shared/session';

export interface ChildLoginController {
  kidProfiles: ReturnType<typeof computed<KidProfile[]>>;
  isKidsLoading: ReturnType<typeof computed<boolean>>;
  isKidsError: ReturnType<typeof computed<boolean>>;
  selectedKid: ReturnType<typeof computed<KidProfile | null>>;
  parentEmail: ReturnType<typeof computed<string>>;
  showParentControls: ReturnType<typeof computed<boolean>>;
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

  return {
    kidProfiles,
    isKidsLoading: computed(() => isKidsLoadingQuery.value),
    isKidsError: computed(() => isKidsErrorQuery.value),
    selectedKid: computed(() => selectedKid.value),
    parentEmail,
    showParentControls,
    handleSelectKid,
    handleHighlightKid,
    handleChangeKid,
    handleRetryKids,
    handleLogoutParent
  };
}
