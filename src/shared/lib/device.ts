export function getBrowserDeviceName(): string {
  if (typeof navigator === 'undefined') return 'web-client';
  const platform = navigator.userAgentData?.platform?.trim() ?? navigator.platform?.trim() ?? '';
  const brand = navigator.userAgentData?.brands?.[0]?.brand?.trim() ?? '';
  const userAgent = navigator.userAgent ?? '';
  const composed = [platform, brand].filter(Boolean).join(' - ');
  const fallback = userAgent.replace(/\s+/g, ' ').trim().slice(0, 80) || 'web-client';
  const name = composed || fallback;
  return name.slice(0, 255);
}
