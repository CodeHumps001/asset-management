'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, refreshSession, setAccessToken } from './api';

export interface Me { id: string; firstName: string; lastName: string; email: string; role: string; department: string | null; permissions: string[] }
interface Ctx { user: Me | null; loading: boolean; login: (e: string, p: string) => Promise<void>; logout: () => Promise<void>; can: (p: string) => boolean }

const AuthContext = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSession().then((u) => { setUser(u); setLoading(false); });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ accessToken: string; user: Me }>('/auth/login', { method: 'POST', body: { email, password } });
    setAccessToken(r.accessToken);
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  const can = useCallback((p: string) => !!user?.permissions.includes(p), [user]);
  return <AuthContext.Provider value={{ user, loading, login, logout, can }}>{children}</AuthContext.Provider>;
}
