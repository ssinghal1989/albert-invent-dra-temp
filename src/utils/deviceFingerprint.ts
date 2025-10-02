// Device fingerprinting utility for anonymous user tracking
export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  canvas?: string;
  webgl?: string;
  fingerprint: string;
}

// Generate a simple canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Albert Invent DRA', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint', 4, 35);
    
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}

// Generate WebGL fingerprint
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return '';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    
    const vendor = gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}~${renderer}`;
  } catch (e) {
    return '';
  }
}

// Simple hash function
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Generate device fingerprint
export function generateDeviceFingerprint(): DeviceFingerprint {
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const cookieEnabled = navigator.cookieEnabled;
  
  // Check storage availability
  let localStorage = false;
  let sessionStorage = false;
  
  try {
    localStorage = typeof window.localStorage !== 'undefined';
    sessionStorage = typeof window.sessionStorage !== 'undefined';
  } catch (e) {
    // Storage might be disabled
  }
  
  const canvas = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  
  // Create a combined fingerprint string
  const combinedString = [
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    cookieEnabled.toString(),
    localStorage.toString(),
    sessionStorage.toString(),
    canvas,
    webgl
  ].join('|');
  
  const fingerprint = simpleHash(combinedString);
  
  return {
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    cookieEnabled,
    localStorage,
    sessionStorage,
    canvas,
    webgl,
    fingerprint
  };
}

// Store fingerprint in localStorage for persistence
export function storeDeviceFingerprint(fingerprint: DeviceFingerprint): void {
  try {
    localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
    localStorage.setItem('device_id', fingerprint.fingerprint);
  } catch (e) {
    console.warn('Could not store device fingerprint:', e);
  }
}

// Retrieve stored fingerprint
export function getStoredDeviceFingerprint(): DeviceFingerprint | null {
  try {
    const stored = localStorage.getItem('device_fingerprint');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// Get or generate device fingerprint
export function getDeviceFingerprint(): DeviceFingerprint {
  console.log("🔍 [getDeviceFingerprint] Getting device fingerprint...");
  const stored = getStoredDeviceFingerprint();
  if (stored) {
    console.log("✅ [getDeviceFingerprint] Using stored fingerprint", {
      deviceId: stored.fingerprint,
      userAgent: stored.userAgent.substring(0, 50) + "...",
      screenResolution: stored.screenResolution
    });
    return stored;
  }
  
  console.log("🆕 [getDeviceFingerprint] Generating new fingerprint...");
  const fingerprint = generateDeviceFingerprint();
  console.log("📱 [getDeviceFingerprint] Generated fingerprint", {
    deviceId: fingerprint.fingerprint,
    userAgent: fingerprint.userAgent.substring(0, 50) + "...",
    screenResolution: fingerprint.screenResolution,
    timezone: fingerprint.timezone,
    language: fingerprint.language,
    platform: fingerprint.platform
  });
  storeDeviceFingerprint(fingerprint);
  console.log("💾 [getDeviceFingerprint] Stored fingerprint in localStorage");
  return fingerprint;
}

// Get device ID (short fingerprint)
export function getDeviceId(): string {
  try {
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;
    
    const fingerprint = getDeviceFingerprint();
    return fingerprint.fingerprint;
  } catch (e) {
    // Fallback to session-based ID
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}