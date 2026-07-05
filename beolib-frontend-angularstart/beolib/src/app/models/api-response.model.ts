/**
 * Wrapper koji backend vraća na svim REST endpoint-ima.
 * data.value = jedan objekat, data.values = lista objekata.
 */
export interface ResponseData<T> {
  values?: T[];
  value?: T;
}

export interface ApiResponse<T> {
  message: string;
  data: ResponseData<T>;
  status: number;
}

/** Izvlači jedan objekat iz ApiResponse (npr. login, getById). */
export function unwrapValue<T>(response: ApiResponse<T>): T {
  const value = response.data?.value;
  if (value === undefined || value === null) {
    throw new Error(response.message || 'API response nema očekivani value.');
  }
  return value;
}

/** Izvlači listu iz ApiResponse (npr. getAll). */
export function unwrapValues<T>(response: ApiResponse<T>): T[] {
  return response.data?.values ?? [];
}
