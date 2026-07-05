import { HttpErrorResponse } from '@angular/common/http';

import { ApiResponse } from '../models/api-response.model';

/** Izvlači message iz backend ApiResponse greške (401, 400, itd.). */
export function getApiErrorMessage(
  error: HttpErrorResponse,
  fallback = 'Došlo je do greške. Pokušajte ponovo.',
): string {
  const body = error.error;

  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as ApiResponse<unknown>).message;
    if (message) {
      return message;
    }
  }

  return fallback;
}
