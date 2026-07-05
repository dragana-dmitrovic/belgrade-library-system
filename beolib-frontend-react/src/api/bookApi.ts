import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues, unwrapVoid } from '../models/api-response.model';
import type {
  Book,
  BookCreateRequest,
  BookSearchParams,
  BookUpdateRequest,
} from '../models/book.model';
import type { BookBranchAvailability } from '../models/book-branch-availability.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/books';

/** GET /api/books/all */
export async function getAllBooks(params: BookSearchParams = {}): Promise<Book[]> {
  const response = await axiosInstance.get<ApiResponse<Book>>(`${basePath}/all`, {
    params,
  });
  return unwrapValues(response.data);
}

/** GET /api/books/{id} */
export async function getBookById(id: number): Promise<Book> {
  const response = await axiosInstance.get<ApiResponse<Book>>(`${basePath}/${id}`);
  return unwrapValue(response.data);
}

/** GET /api/books/{id}/branches — dostupnost knjige po filijali */
export async function getBranchAvailabilityForBook(
  bookId: number,
): Promise<BookBranchAvailability[]> {
  const response = await axiosInstance.get<ApiResponse<BookBranchAvailability>>(
    `${basePath}/${bookId}/branches`,
  );
  return unwrapValues(response.data);
}

/** POST /api/books/add — ADMIN */
export async function createBook(request: BookCreateRequest): Promise<Book> {
  const response = await axiosInstance.post<ApiResponse<Book>>(`${basePath}/add`, request);
  return unwrapValue(response.data);
}

/** PUT /api/books/update — ADMIN */
export async function updateBook(request: BookUpdateRequest): Promise<Book> {
  const response = await axiosInstance.put<ApiResponse<Book>>(`${basePath}/update`, request);
  return unwrapValue(response.data);
}

/** DELETE /api/books/delete/{id} — ADMIN (value: null je namerno) */
export async function deleteBook(id: number): Promise<void> {
  const response = await axiosInstance.delete<ApiResponse<unknown>>(`${basePath}/delete/${id}`);
  unwrapVoid(response.data);
}
