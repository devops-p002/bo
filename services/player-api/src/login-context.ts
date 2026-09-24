import geoip from 'geoip-lite';

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown';

/**
 * Coarse device classification from a User-Agent string - real,
 * server-side signal, but deliberately not the same thing as device
 * *fingerprinting*. A UA header is trivially spoofable and shared by
 * millions of devices, so this can answer "was this a phone or a
 * desktop browser" for Member Search, but it can never uniquely
 * re-identify a specific returning device the way a canvas/WebGL/audio
 * fingerprint collected client-side could - that's a separate, bigger
 * feature (a `player_devices` table correlating fingerprints across
 * accounts for fraud/multi-account detection), not built here.
 */
export function classifyDevice(userAgent: string | undefined | null): DeviceType {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (/bot|crawl|spider|slurp|curl|wget|postman/.test(ua)) return 'Bot';
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return 'Tablet';
  if (/mobi|iphone|ipod|android/.test(ua)) return 'Mobile';
  return 'Desktop';
}

/**
 * IP -> country via an offline MaxMind-lite dataset bundled with
 * geoip-lite (no outbound network call, nothing to leak the player's IP
 * to). Never a client-reported location: the browser Geolocation API
 * needs an explicit permission prompt most players will decline, and
 * even when granted it's a value the client controls, not one the
 * server can trust to be honest - it takes a spoofed VPN/proxy IP right
 * back to square one. Loopback/private ranges (a local dev environment,
 * or a misconfigured proxy hop) resolve to null, which is the correct,
 * honest answer rather than a wrong guess.
 */
export function lookupCountry(ip: string | undefined | null): string | null {
  if (!ip) return null;
  return geoip.lookup(ip)?.country ?? null;
}
