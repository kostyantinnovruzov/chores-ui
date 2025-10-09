export interface KidProfile {
  id: number;
  nickname: string;
  avatarPath: string | null;
  passcodeHint: string | null;
  timezone: string | null;
  status: 'active' | 'inactive' | (string & {});
}
