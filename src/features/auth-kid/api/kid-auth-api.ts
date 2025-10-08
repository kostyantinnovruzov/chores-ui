import { http } from '@/shared/api';

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
    const { data } = await http.post<KidLoginResponse>('/auth/kids/login', payload);
    return data;
  }
};
