import { http } from '@/shared/api';
import { useSessionStore } from '@/shared/session';

export interface KidLoginRequest {
  child_id: number;
  passcode: string[];
  device_name: string;
}

export interface KidLoginResponse {
  token: string;
  token_type: string;
  user: {
    id: number;
    type: 'child';
    nickname: string;
    parent_id: number;
    avatar_path: string | null;
    timezone: string;
    status: string;
  };
}

export const kidAuthApi = {
  async login(payload: KidLoginRequest): Promise<KidLoginResponse> {
    const session = useSessionStore();
    const parentToken = session.parentToken;
    const headers = parentToken
      ? {
          Authorization: `Bearer ${parentToken}`
        }
      : undefined;
    const { data } = await http.post<KidLoginResponse>('auth/kids/login', payload, {
      headers
    });
    return data;
  }
};
