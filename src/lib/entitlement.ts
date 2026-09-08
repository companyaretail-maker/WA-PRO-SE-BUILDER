const STORAGE_KEY = 'wa_pro_se_entitlement';

export function storeEntitlement(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private browsing / storage disabled: the session still works, it just
    // won't survive a reload.
  }
}

export function readEntitlement(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearEntitlement() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

/** Asks the server whether a stored token is still signed and unexpired. */
export async function verifyEntitlement(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/entitlement/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return false;
  }
}
