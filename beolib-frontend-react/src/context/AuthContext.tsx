import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '../api/authApi';
import { TOKEN_KEY, USER_KEY, USER_ROLE_KEY } from '../auth/auth.constants';
import type { LoginRequest, RegisterRequest } from '../models/auth.model';
import type { UserRole } from '../models/enums.model';
import type { User } from '../models/user.model';

interface AuthContextValue {
  user: User | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  getCurrentUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function readStoredRole(): UserRole | null {
  const role = localStorage.getItem(USER_ROLE_KEY);
  if (role === 'USER' || role === 'ADMIN') {
    return role;
  }
  return null;
}

function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(USER_ROLE_KEY, user.role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const isLoggedIn = useCallback((): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }, []);

  const getCurrentUserRole = useCallback((): UserRole | null => {
    return readStoredRole();
  }, []);

  const isAdmin = useCallback((): boolean => {
    return getCurrentUserRole() === 'ADMIN';
  }, [getCurrentUserRole]);

  const login = useCallback(async (request: LoginRequest): Promise<void> => {
    const response = await authApi.login(request);
    saveSession(response.token, response.user);
    setUser(response.user);
  }, []);

  /** Ne čuva token — nakon registracije korisnik ide na /login. */
  const register = useCallback(async (request: RegisterRequest): Promise<void> => {
    await authApi.register(request);
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      register,
      logout,
      isLoggedIn,
      isAdmin,
      getCurrentUserRole,
    }),
    [user, login, register, logout, isLoggedIn, isAdmin, getCurrentUserRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth mora biti unutar AuthProvider-a.');
  }
  return context;
}
