import { http } from '@/shared/api';

export interface ParentLoginRequest {
  email: string;
  password: string;
  device_name: string;
  guard?: 'parent' | 'admin';
}

export interface ParentLoginResponse {
  token: string;
  token_type: string;
  user: {
    id: number;
    type: 'parent' | 'admin';
    email: string;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    timezone: string | null;
    status: string;
  };
}

export const parentAuthApi = {
  async login(payload: ParentLoginRequest): Promise<ParentLoginResponse> {
    const { data } = await http.post<ParentLoginResponse>('auth/login', payload);
    return data;
  }
};
