import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
}

export type Role = 'guest' | 'user' | 'admin';

export interface AuthValue {
  user: AppUser | null;
  role: Role;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * NOTE: this is a stand-in, not an identity provider. `login()` fabricates a
 * local user; nothing is authenticated and no session crosses devices.
 *
 * Entitlements deliberately do NOT depend on it — a purchase is proven by a
 * server-signed token backed by PayPal (see src/lib/entitlement.ts), so wiring a
 * real provider later does not require re-plumbing the paywall. `hasPurchased`
 * was removed from the user object for that reason: it was a second, unverified
 * source of truth about who had paid.
 */
const DEFAULT: AuthValue = {
  user: null,
  role: 'guest',
  login: async () => {},
  logout: async () => {},
};

export const AuthContext = createContext<AuthValue>(DEFAULT);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async () => {
    setUser({ uid: 'mock-user-123', name: 'Pro Se Litigant', email: 'user@example.com' });
    setRole('user');
  };

  const logout = async () => {
    setUser(null);
    setRole('guest');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0d0d0e] flex items-center justify-center text-accent font-mono text-sm animate-pulse">
        Initializing Auth State...
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, role, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthValue => useContext(AuthContext);
