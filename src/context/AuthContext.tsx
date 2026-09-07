import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'guest' | 'user' | 'admin'>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async () => {
    // Mock login
    setUser({
      uid: 'mock-user-123',
      name: 'Pro Se Litigant',
      email: 'user@example.com',
      hasPurchased: false
    });
    setRole('user');
  };

  const logout = async () => {
    setUser(null);
    setRole('guest');
  };

  if (loading) return <div className="h-screen w-full bg-[#0d0d0e] flex items-center justify-center text-accent font-mono text-sm animate-pulse">Initializing Auth State...</div>;

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
