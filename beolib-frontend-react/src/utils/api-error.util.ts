import axios from 'axios';

import type { ApiResponse } from '../models/api-response.model';

/** Izvlači message iz backend ApiResponse greške (401, 400, itd.). */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Došlo je do greške. Pokušajte ponovo.',
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as ApiResponse<unknown>).message;
      if (message) {
        return message;
      }
    }

    if (error.response?.status === 401) {
      return 'Sesija je istekla ili niste prijavljeni. Prijavite se ponovo.';
    }

    if (error.response?.status === 403) {
      return 'Nemate dozvolu za ovu akciju.';
    }

    if (error.response?.status === 500) {
      return 'Došlo je do greške na serveru. Pokušajte ponovo.';
    }
  }

  return fallback;
}
