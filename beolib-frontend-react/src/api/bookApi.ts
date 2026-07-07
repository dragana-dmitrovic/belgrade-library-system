import type { ApiResponse } from '../models/api-response.model';
import { unwrapValue, unwrapValues, unwrapVoid } from '../models/api-response.model';
import type {
  Book,
  BookCreateRequest,
  BookCreateWithInventoryRequest,
  BookMetadataLookup,
  BookPagedParams,
  BookSearchParams,
  BookUpdateRequest,
  PagedResponse,
} from '../models/book.model';
import type { BookBranchAvailability } from '../models/book-branch-availability.model';
import type { BookReview } from '../models/book-review.model';
import { axiosInstance } from './axiosInstance';

const basePath = '/books';

/** GET /api/books/all — fallback, ne koristi paginaciju */
export async function getAllBooks(params: BookSearchParams = {}): Promise<Book[]> {
  const response = await axiosInstance.get<ApiResponse<Book>>(`${basePath}/all`, {
    params,
  });
  return unwrapValues(response.data);
}

/** GET /api/books — paginirani katalog */
export async function getBooksPaged(params: BookPagedParams = {}): Promise<PagedResponse<Book>> {
  const response = await axiosInstance.get<ApiResponse<PagedResponse<Book>>>(basePath, {
    params,
  });
  return unwrapValue(response.data);
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

/** GET /api/books/{id}/reviews — javne recenzije čitalaca */
export async function getBookReviews(bookId: number): Promise<BookReview[]> {
  const response = await axiosInstance.get<ApiResponse<BookReview>>(`${basePath}/${bookId}/reviews`);
  return unwrapValues(response.data);
}

/** POST /api/books/add — LIBRARIAN */
export async function createBook(request: BookCreateRequest): Promise<Book> {
  const response = await axiosInstance.post<ApiResponse<Book>>(`${basePath}/add`, request);
  return unwrapValue(response.data);
}

/** GET /api/books/isbn/{isbn}/lookup — LIBRARIAN */
export async function lookupBookByIsbn(isbn: string): Promise<BookMetadataLookup> {
  const normalized = isbn.replace(/[\s-]/g, '');
  const response = await axiosInstance.get<ApiResponse<BookMetadataLookup>>(
    `${basePath}/isbn/${encodeURIComponent(normalized)}/lookup`,
  );
  return unwrapValue(response.data);
}

/** POST /api/books/add-with-inventory — LIBRARIAN */
export async function createBookWithInventory(
  request: BookCreateWithInventoryRequest,
): Promise<Book> {
  const response = await axiosInstance.post<ApiResponse<Book>>(
    `${basePath}/add-with-inventory`,
    request,
  );
  return unwrapValue(response.data);
}

/** PUT /api/books/update — LIBRARIAN */
export async function updateBook(request: BookUpdateRequest): Promise<Book> {
  const response = await axiosInstance.put<ApiResponse<Book>>(`${basePath}/update`, request);
  return unwrapValue(response.data);
}

/** DELETE /api/books/delete/{id} — LIBRARIAN (value: null je namerno) */
export async function deleteBook(id: number): Promise<void> {
  const response = await axiosInstance.delete<ApiResponse<unknown>>(`${basePath}/delete/${id}`);
  unwrapVoid(response.data);
}
