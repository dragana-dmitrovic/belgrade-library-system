/** Deljeni sessionStorage ključevi — AuthContext i axios interceptor koriste iste vrednosti. */

export const TOKEN_KEY = 'beolib_token';

export const USER_KEY = 'beolib_user';

export const USER_ROLE_KEY = 'beolib_user_role';



export const AUTH_CLEARED_EVENT = 'beolib-auth-cleared';



const VALID_ROLES = new Set(['MEMBER', 'LIBRARIAN']);



function authStorage(): Storage {

  return sessionStorage;

}



/** Uklanja zastarele auth podatke iz localStorage (prethodna verzija aplikacije). */

export function clearLegacyLocalStorageAuth(): void {

  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USER_KEY);

  localStorage.removeItem(USER_ROLE_KEY);

}



clearLegacyLocalStorageAuth();



export function isValidUserRole(role: string | null | undefined): role is 'MEMBER' | 'LIBRARIAN' {

  return role === 'MEMBER' || role === 'LIBRARIAN';

}



export function getStoredToken(): string | null {

  return authStorage().getItem(TOKEN_KEY);

}



export function clearStoredSession(): void {

  authStorage().removeItem(TOKEN_KEY);

  authStorage().removeItem(USER_KEY);

  authStorage().removeItem(USER_ROLE_KEY);

  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));

}



interface StoredUserShape {

  role?: string;

}



/** Proverava da li su token, user i role usklađeni i validni. */

export function hasValidStoredSession(): boolean {

  const token = getStoredToken();

  if (!token?.trim()) {

    return false;

  }



  const role = authStorage().getItem(USER_ROLE_KEY);

  if (!isValidUserRole(role)) {

    return false;

  }



  const rawUser = authStorage().getItem(USER_KEY);

  if (!rawUser) {

    return false;

  }



  try {

    const storedUser = JSON.parse(rawUser) as StoredUserShape;

    return isValidUserRole(storedUser.role) && storedUser.role === role;

  } catch {

    return false;

  }

}



export interface PersistedSessionInput {

  token: string;

  user: {

    role: string;

  };

}



/** Upisuje sesiju u sessionStorage i proverava da je upis uspeo. */

export function persistSession({ token, user }: PersistedSessionInput): void {

  if (!token?.trim()) {

    throw new Error('Login nije vratio token.');

  }

  if (!isValidUserRole(user.role)) {

    throw new Error('Nalog ima nevažeću ulogu. Obratite se biblioteci.');

  }



  authStorage().setItem(TOKEN_KEY, token.trim());

  authStorage().setItem(USER_KEY, JSON.stringify(user));

  authStorage().setItem(USER_ROLE_KEY, user.role);



  if (!hasValidStoredSession()) {

    clearStoredSession();

    throw new Error('Sesija nije sačuvana u browseru. Proverite sessionStorage i pokušajte ponovo.');

  }

}



/** Uklanja nevalidnu sesiju; vraća true ako je sesija bila validna. */

export function ensureValidStoredSession(): boolean {

  if (hasValidStoredSession()) {

    return true;

  }



  const storage = authStorage();

  const hadAuthData =

    !!getStoredToken() ||

    !!storage.getItem(USER_KEY) ||

    !!storage.getItem(USER_ROLE_KEY);



  if (hadAuthData) {

    clearStoredSession();

  }



  return false;

}



/** Odbacuje poznate zastarele role iz sessionStorage. */

export function isLegacyRole(role: string | null | undefined): boolean {

  return role === 'USER' || role === 'ADMIN';

}



export function sanitizeLegacyRoleStorage(): void {

  const role = authStorage().getItem(USER_ROLE_KEY);

  if (isLegacyRole(role) || (role != null && !VALID_ROLES.has(role))) {

    clearStoredSession();

  }

}



export function readStoredRole(): 'MEMBER' | 'LIBRARIAN' | null {

  const role = authStorage().getItem(USER_ROLE_KEY);

  return isValidUserRole(role) ? role : null;

}



export function readStoredUserJson(): StoredUserShape | null {

  if (!hasValidStoredSession()) {

    return null;

  }



  const raw = authStorage().getItem(USER_KEY);

  if (!raw) {

    return null;

  }



  try {

    return JSON.parse(raw) as StoredUserShape;

  } catch {

    return null;

  }

}

