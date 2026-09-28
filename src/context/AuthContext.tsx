import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as authApi from '../lib/api/auth';
import type { AuthUser } from '../lib/api/auth';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; city?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.fetchCurrentUser()
      .then(res => setCurrentUser(res.user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setCurrentUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setCurrentUser(res.user);
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (data: { name?: string; bio?: string; city?: string }) => {
    const res = await authApi.updateProfile(data);
    setCurrentUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
