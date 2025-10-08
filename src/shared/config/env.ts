interface EnvConfig {
  apiUrl: string;
}
console.log(import.meta.env.VITE_API_URL);
export function getEnv(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL
  };
}
