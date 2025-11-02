type NavigatorUAData = {
  platform?: string;
  brands?: Array<{ brand?: string }>;
};

export function getBrowserDeviceName(): string {
  if (typeof navigator === 'undefined') return 'web-client';
  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
  const platform = nav.userAgentData?.platform?.trim() ?? nav.platform?.trim() ?? '';
  const brand = nav.userAgentData?.brands?.[0]?.brand?.trim() ?? '';
  const userAgent = nav.userAgent ?? '';
  const composed = [platform, brand].filter(Boolean).join(' - ');
  const fallback = userAgent.replace(/\s+/g, ' ').trim().slice(0, 80) || 'web-client';
  const name = composed || fallback;
  return name.slice(0, 255);
}
