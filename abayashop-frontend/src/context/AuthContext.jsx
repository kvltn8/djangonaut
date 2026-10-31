import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { tokens } from '../api/client';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const hasToken = !!tokens.get()?.access;

  const me = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: hasToken,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const logout = useCallback(() => {
    tokens.clear();
    qc.removeQueries({ queryKey: ['me'] });
    qc.removeQueries({ queryKey: ['orders'] });
    qc.removeQueries({ queryKey: ['order'] });
    qc.removeQueries({ queryKey: ['customer'] });
  }, [qc]);

  // refresh token died -> drop session
  useEffect(() => {
    const h = () => logout();
    window.addEventListener('auth:expired', h);
    return () => window.removeEventListener('auth:expired', h);
  }, [logout]);

  const login = useCallback(async (creds) => {
    await authApi.login(creds);
    await qc.fetchQuery({ queryKey: ['me'], queryFn: authApi.getMe });
  }, [qc]);

  const register = useCallback(async (data) => {
    await authApi.register(data);
    await login({ username: data.username, password: data.password });
  }, [login]);

  const value = useMemo(() => ({
    user: tokens.get()?.access ? me.data ?? null : null,
    loading: hasToken && me.isLoading,
    isAuthed: !!me.data && !!tokens.get()?.access,
    login, register, logout,
  }), [me.data, me.isLoading, hasToken, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
