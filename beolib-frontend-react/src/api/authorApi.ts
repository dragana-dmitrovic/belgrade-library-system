import type { ApiResponse } from '../models/api-response.model';
import { unwrapValues } from '../models/api-response.model';
import { axiosInstance } from './axiosInstance';

/** GET /api/authors?search= — LIBRARIAN */
export async function searchAuthors(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const response = await axiosInstance.get<ApiResponse<string>>('/authors', {
    params: { search: trimmed },
  });
  return unwrapValues(response.data);
}
