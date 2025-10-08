interface EnvConfig {
  apiUrl: string;
}
export function getEnv(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL
  };
}
