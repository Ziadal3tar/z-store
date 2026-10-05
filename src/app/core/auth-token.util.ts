export const AUTH_TOKEN_KEY = 'userToken';

function getStorage(): Storage | null {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
}

export function getAuthToken(): string | null {
  return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function setAuthToken(token: string): void {
  getStorage()?.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  getStorage()?.removeItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}

export function isAuthTokenValid(token = getAuthToken()): boolean {
  if (!token) return false;

  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return false;
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
    const payload = JSON.parse(atob(padded));
    if (payload?.exp && Number(payload.exp) * 1000 <= Date.now()) {
      return false;
    }
    return Boolean(payload?.id);
  } catch {
    return false;
  }
}
