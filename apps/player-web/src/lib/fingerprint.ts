// Real device fingerprinting: combines several weak, individually
// spoofable browser signals into a single hash that's stable for a
// given real browser install. This is genuinely different from the
// User-Agent-only device *classification* services/player-api's
// login-context.ts does server-side - that answers "phone or desktop";
// this is what lets the backend answer "have I seen this exact browser
// before, under a different account" (services/backoffice-api's
// player-devices linked-accounts lookup). Computed and cached
// client-side because none of these signals (canvas rendering, WebGL
// driver strings, installed fonts via screen metrics) are available to
// the server at all - unlike IP/geolocation, there's no honest
// server-side substitute for this one.
const STORAGE_KEY = 'bq_device_fingerprint';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function canvasSignal(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('bq-fp', 2, 2);
    return canvas.toDataURL();
  } catch {
    // Canvas reads can be blocked by privacy extensions/settings - an
    // empty signal just makes this one weak signal less discriminating,
    // never a reason to fail fingerprint collection entirely.
    return '';
  }
}

function webglSignal(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return '';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor}~${renderer}`;
  } catch {
    return '';
  }
}

function collectSignals(): string {
  const nav = window.navigator;
  const extendedNav = nav as Navigator & { deviceMemory?: number };
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';

  return [
    nav.userAgent,
    nav.language,
    (nav.languages || []).join(','),
    String(nav.hardwareConcurrency ?? ''),
    String(extendedNav.deviceMemory ?? ''),
    nav.platform ?? '',
    screenInfo,
    timezone,
    canvasSignal(),
    webglSignal(),
  ].join('|');
}

/**
 * Returns a stable per-browser fingerprint hash, computing it once and
 * caching in localStorage so repeat calls (every login) don't re-run
 * canvas/WebGL reads. Never throws - a private-mode browser that blocks
 * localStorage or canvas reads still gets a (less stable, still usable)
 * freshly-computed value each call rather than breaking login/register.
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;
  } catch {
    // localStorage unavailable - fall through and compute fresh below.
  }

  const fingerprint = await sha256Hex(collectSignals());

  try {
    localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch {
    // Ignore - the fingerprint is still returned for this call even if
    // it can't be cached for the next one.
  }

  return fingerprint;
}
