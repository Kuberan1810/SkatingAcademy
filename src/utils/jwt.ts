/**
 * Helper to decode base64 across Web and React Native environments safely.
 */
function base64Decode(str: string): string {
  try {
    // Replace URL-safe characters
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add required base64 padding '='
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    if (typeof atob === 'function') {
      return atob(padded);
    }

    // React Native Pure JS base64 decoder fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < padded.length; i++) {
      const char = padded.charAt(i);
      if (char === '=') break;
      const index = chars.indexOf(char);
      if (index === -1) continue;

      buffer = (buffer << 6) | index;
      bits += 6;

      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }
    return output;
  } catch {
    return '';
  }
}

/**
 * Checks if a JWT token is expired, malformed, or missing.
 * Returns true if expired, false if still valid.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return true;
  }

  try {
    const parts = token.split('.');
    // Standard JWT has 3 parts: header.payload.signature
    if (parts.length !== 3) {
      return false;
    }

    const payloadJson = base64Decode(parts[1]);
    if (!payloadJson) {
      return false;
    }

    const payload = JSON.parse(payloadJson);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    // JWT exp is in seconds, Date.now() is in ms
    // Subtract a 5-second buffer to prevent edge-case race conditions
    const expirationTimeMs = payload.exp * 1000;
    const currentTimeMs = Date.now();

    return currentTimeMs >= expirationTimeMs - 5000;
  } catch {
    return false;
  }
}
