import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '../api/authApi';
import {
  AUTH_CLEARED_EVENT,
  USER_KEY,
  clearLegacyLocalStorageAuth,
  clearStoredSession,
  ensureValidStoredSession,
  hasValidStoredSession,
  isValidUserRole,
  persistSession,
  readStoredRole,
  sanitizeLegacyRoleStorage,
} from '../auth/auth.constants';
import type { LoginRequest, RegisterRequest } from '../models/auth.model';
import type { UserRole } from '../models/enums.model';
import type { User } from '../models/user.model';

interface AuthContextValue {
  user: User | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
  isLibrarian: () => boolean;
  getCurrentUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromSession(): User | null {
  clearLegacyLocalStorageAuth();
  sanitizeLegacyRoleStorage();
  if (!ensureValidStoredSession()) {
    return null;
  }

  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as User;
    if (!isValidUserRole(parsed.role)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUserFromSession());

  const logout = useCallback((): void => {
    clearStoredSession();
    setUser(null);
  }, []);

  const reconcileSession = useCallback((): void => {
    sanitizeLegacyRoleStorage();

    if (!hasValidStoredSession()) {
      if (user !== null) {
        setUser(null);
      }
      return;
    }

    const storedUser = loadUserFromSession();
    if (storedUser === null) {
      setUser(null);
      return;
    }

    if (user?.id !== storedUser.id || user?.role !== storedUser.role) {
      setUser(storedUser);
    }
  }, [user]);

  useEffect(() => {
    reconcileSession();

    function handleAuthCleared() {
      setUser(null);
    }

    function handleFocus() {
      reconcileSession();
    }

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reconcileSession]);

  const isLoggedIn = useCallback((): boolean => {
    return user !== null && hasValidStoredSession();
  }, [user]);

  const getCurrentUserRole = useCallback((): UserRole | null => {
    if (!isLoggedIn()) {
      return null;
    }
    return readStoredRole();
  }, [isLoggedIn]);

  const isLibrarian = useCallback((): boolean => {
    return getCurrentUserRole() === 'LIBRARIAN';
  }, [getCurrentUserRole]);

  const login = useCallback(async (request: LoginRequest): Promise<void> => {
    const response = await authApi.login(request);

    persistSession({
      token: response.token,
      user: response.user,
    });

    setUser(response.user);
  }, []);

  /** Ne čuva token — nakon registracije korisnik ide na /login. */
  const register = useCallback(async (request: RegisterRequest): Promise<void> => {
    await authApi.register(request);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      register,
      logout,
      isLoggedIn,
      isLibrarian,
      getCurrentUserRole,
    }),
    [user, login, register, logout, isLoggedIn, isLibrarian, getCurrentUserRole],
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
