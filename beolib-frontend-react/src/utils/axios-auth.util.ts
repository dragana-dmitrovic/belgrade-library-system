import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

/** Postavlja Authorization header kompatibilno sa Axios 1.x AxiosHeaders API-jem. */
export function applyAuthHeader(config: InternalAxiosRequestConfig, token: string): void {
  const value = `Bearer ${token}`;

  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', value);
    return;
  }

  config.headers.Authorization = value;
}

/** Proverava da li je zahtev imao Authorization header. */
export function requestHadAuthHeader(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config?.headers) {
    return false;
  }

  const headers = config.headers;

  if (typeof headers.get === 'function') {
    return Boolean(headers.get('Authorization') ?? headers.get('authorization'));
  }

  const record = headers as Record<string, string | undefined>;
  return Boolean(record.Authorization ?? record.authorization);
}

export function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return url.includes('/auth/login') || url.includes('/auth/register');
}

/** True samo kada 401 zaista ukazuje na isteklu/nevalidnu sesiju, ne na poslovnu grešku. */
export function isAuthenticationFailure401(error: AxiosError): boolean {
  if (error.response?.status !== 401) {
    return false;
  }

  const body = error.response.data;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = String((body as { message?: string }).message ?? '').toLowerCase();
    if (!message) {
      return true;
    }

    return (
      message.includes('authentication required') ||
      message.includes('invalid email or password') ||
      message.includes('full authentication is required') ||
      message.includes('jwt') ||
      message.includes('token') ||
      message.includes('expired') ||
      message.includes('unauthorized')
    );
  }

  return true;
}
