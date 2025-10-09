import type { KidProfile } from '../model/types';

import { http } from '@/shared/api';

interface KidProfileDto {
  id: number;
  nickname: string;
  avatar_path: string | null;
  passcode_hint: string | null;
  timezone: string | null;
  status: string;
}

type KidProfilesResponse =
  | KidProfileDto[]
  | {
      data?: KidProfileDto[];
    };

function mapKidProfile(dto: KidProfileDto): KidProfile {
  return {
    id: dto.id,
    nickname: dto.nickname,
    avatarPath: dto.avatar_path,
    passcodeHint: dto.passcode_hint,
    timezone: dto.timezone,
    status: (dto.status ?? 'inactive') as KidProfile['status']
  };
}

function extractProfiles(payload: KidProfilesResponse): KidProfileDto[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

export const parentKidsApi = {
  async list(): Promise<KidProfile[]> {
    const { data } = await http.get<KidProfilesResponse>('parent/children');
    return extractProfiles(data).map(mapKidProfile);
  }
};
