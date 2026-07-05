import axios from 'axios';

import type { ApiResponse } from '../models/api-response.model';

/** Izvlači message iz backend ApiResponse greške (401, 400, itd.). */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Došlo je do greške. Pokušajte ponovo.',
): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const body = error.response.data;
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as ApiResponse<unknown>).message;
      if (message) {
        return message;
      }
    }
  }

  return fallback;
}
