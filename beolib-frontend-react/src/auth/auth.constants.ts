/** Deljeni localStorage ključevi — AuthContext i axios interceptor koriste iste vrednosti. */
export const TOKEN_KEY = 'beolib_token';
export const USER_KEY = 'beolib_user';
export const USER_ROLE_KEY = 'beolib_user_role';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
